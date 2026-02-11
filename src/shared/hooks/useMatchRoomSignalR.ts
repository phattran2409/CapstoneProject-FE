import { useEffect, useState, useCallback, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
  HubConnectionState,
  HttpTransportType,
} from "@microsoft/signalr";
import { getAuthToken } from "@/shared/api/client";

const MATCH_ROOM_HUB_URL = "https://api.kickify.site/hubs/matchroom";

const MATCH_ROOM_HUB_METHODS = {
  JoinRoomGroup: "JoinRoomGroup",
  LeaveRoomGroup: "LeaveRoomGroup",
} as const;

const MATCH_ROOM_HUB_EVENTS = {
  // Ack events for group join/leave (per documentation)
  JoinedRoom: "JoinedRoom",
  LeftRoom: "LeftRoom",

  // Error event (per documentation)
  Error: "Error",

  // Legacy/room realtime events currently used in app
  UserJoinedRoom: "UserJoinedRoom",
  UserLeftRoom: "UserLeftRoom",
  ParticipantUpdated: "ParticipantUpdated",
  RoomStatusChanged: "RoomStatusChanged",
  // Per updated documentation: event name is "UserKicked"
  UserKicked: "UserKicked",
  // Payment-related events
  ParticipantPaid: "ParticipantPaid",
  // Formation-related events
  FormationUpdated: "FormationUpdated",
} as const;

/**
 * SignalR events từ MatchRoom Hub
 */
export interface UseMatchRoomSignalROptions {
  // Room ID để join vào group
  roomId: string;

  /**
   * Optional team assignment for JoinRoomGroup (per documentation: "A" | "B" | null)
   * - undefined: call JoinRoomGroup(roomId) (backward compatible)
   * - null: spectator
   * - "A"/"B": join team-specific chat group
   */
  teamAssignment?: "A" | "B" | null;

  // Events từ server
  // Ack events for JoinRoomGroup / LeaveRoomGroup
  onJoinedRoomGroup?: (payload: JoinedRoomGroupPayload) => void;
  onLeftRoomGroup?: (payload: LeftRoomGroupPayload) => void;

  onUserJoinedRoom?: (payload: UserJoinedPayload) => void;
  onUserLeftRoom?: (payload: UserLeftPayload) => void;
  onParticipantUpdated?: (payload: ParticipantUpdatedPayload) => void;
  onRoomStatusChanged?: (payload: RoomStatusPayload) => void;
  onPlayerKicked?: (payload: PlayerKickedPayload) => void;

  // Events từ server - Room chat
  onTeamChatSwitched?: (payload: TeamChatSwitchedPayload) => void;
  onReceiveRoomMessage?: (payload: RoomMessage) => void;
  onReceiveRoomMessages?: (payload: RoomMessagesPayload) => void;
  onRoomUserTyping?: (payload: RoomTypingPayload) => void;
  onRoomUserStopTyping?: (payload: RoomStopTypingPayload) => void;

  onError?: (payload: any) => void;

  // Payment events
  onParticipantPaid?: (payload: ParticipantPaidEvent) => void;

  // Formation events
  onFormationUpdated?: (payload: FormationUpdatedPayload) => void;
}

// ==================== Payload Types ====================

/**
 * Payload ack sau khi JoinRoomGroup thành công
 * (Docs: JoinedRoom event - PascalCase keys from server)
 */
export interface JoinedRoomGroupPayload {
  roomId: string;
  teamAssignment: "A" | "B" | null;
  userId: string;
  userName: string;
}

/**
 * Payload ack sau khi LeaveRoomGroup thành công
 * (Docs: LeftRoom event)
 */
export interface LeftRoomGroupPayload {
  roomId: string;
}

/**
 * Payload khi có người chơi mới tham gia room
 * Theo API: UserJoinedRoom event
 */
export interface UserJoinedPayload {
  roomId: string;
  participantId?: string;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  userAvatar?: string | null; // Legacy fallback
  teamAssignment?: "A" | "B" | "Unassigned";
  position?: string;
  filledSlots: number;
  totalSlots: number;
  joinedAt: string;
  // Legacy fields (for backward compatibility)
  teamId?: string;
  teamName?: string;
}

/**
 * Payload khi có người chơi rời khỏi room
 * Theo API: UserLeftRoom event - bao gồm host transfer logic
 */
export interface UserLeftPayload {
  roomId: string;
  userId: string;
  userName: string;
  filledSlots: number;
  totalSlots: number;
  isRoomDeleted: boolean;
  newHostId?: string | null;
  leftAt: string;
}

/**
 * Payload khi người chơi thay đổi team/position
 * Theo API: ParticipantUpdated event
 */
export interface ParticipantUpdatedPayload {
  roomId: string;
  userId: string;
  userName: string;
  avatarUrl?: string | null;
  teamAssignment: "A" | "B" | "Unassigned";
  position?: string | null;
  updatedAt: string;
}

/**
 * Payload khi trạng thái room thay đổi
 * Theo API: RoomStatusChanged event
 */
export interface RoomStatusPayload {
  roomId: string;
  status: "Open" | "Full" | "Closed" | "InProgress" | "Completed" | "Cancelled";
  changedAt: string;
  // Legacy fields (for backward compatibility)
  currentPlayers?: number;
  totalPlayers?: number;
  filledSlots?: number;
  totalSlots?: number;
}

/**
 * Payload khi một người chơi bị kick
 */
export interface PlayerKickedPayload {
  roomId: string;
  kickedUserId: string;
  kickedUserName: string;
  kickedBy: string;
  reason?: string;
  // Extended fields from latest documentation
  filledSlots?: number;
  totalSlots?: number;
  kickedAt?: string;
}

/**
 * Room Chat Channel enum
 */
export enum RoomChatChannel {
  All = 0,
  TeamA = 1,
  TeamB = 2,
}

export interface TeamChatSwitchedPayload {
  roomId: string;
  teamAssignment: string; // "A", "B", hoặc "Unassigned"
}

export interface RoomMessage {
  messageId: string;
  roomId: string;
  channel: number; // RoomChatChannel as number (0=All, 1=TeamA, 2=TeamB)
  senderId: string;
  senderFullName: string;
  senderAvatarUrl: string | null;
  messageText: string;
  sentAt: string;
}

/**
 * Payload khi nhận danh sách messages
 * Backend: ReceiveRoomMessages event với result.Value từ GetRoomMessagesQuery
 */
export interface RoomMessagesPayload {
  messages: RoomMessage[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

/**
 * Payload khi user đang typing
 * Backend: RoomUserTyping event với { RoomId, Channel, UserId, UserName }
 */
export interface RoomTypingPayload {
  roomId: string;
  channel: number; // RoomChatChannel as number
  userId: string;
  userName: string;
}

/**
 * Payload khi user stop typing
 * Backend: RoomUserStopTyping event với { RoomId, Channel, UserId }
 * Lưu ý: Không có UserName trong payload này
 */
export interface RoomStopTypingPayload {
  roomId: string;
  channel: number; // RoomChatChannel as number
  userId: string;
}

/**
 * Payload khi một participant thanh toán thành công
 * Backend: ParticipantPaid event
 */
export interface ParticipantPaidEvent {
  roomId: string;
  userId: string;
  userName: string;
  amountPaid: number;
  totalDepositCollected: number;
  paidAt: string;
}

/**
 * Payload khi captain cập nhật đội hình thành công
 * Backend: FormationUpdated event
 */
export interface FormationUpdatedPayload {
  roomId: string;
  team: "A" | "B";
  formationName: string;
  assignments: Array<{
    playerId: string;
    slotId: string;
    position: string; // "Goalkeeper" | "Defender" | "Midfielder" | "Forward"
  }>;
  updatedAt: string;
}

/**
 * Hook quản lý kết nối SignalR cho Match Room
 *
 * Features:
 * - Tự động kết nối và join room group
 * - Tự động reconnect khi mất kết nối
 * - Đăng ký các event listeners
 * - Cleanup khi unmount
 *
 * @example
 * const { isConnected, connectionState } = useMatchRoomSignalR({
 *   roomId: '123',
 *   onUserJoinedRoom: (payload) => {
 *     console.log('User joined:', payload.userName);
 *   },
 *   onUserLeftRoom: (payload) => {
 *     console.log('User left:', payload.userName);
 *   },
 * });
 */
export const useMatchRoomSignalR = (options: UseMatchRoomSignalROptions) => {
  const { roomId } = options;
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasJoinedRoomGroup, setHasJoinedRoomGroup] = useState(false);
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );

  // Use ref to store options to avoid stale closure issues
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const normalizeJoinedRoomGroupPayload = useCallback(
    (raw: any): JoinedRoomGroupPayload => {
      const teamAssignmentRaw = raw?.TeamAssignment ?? raw?.teamAssignment ?? null;
      return {
        roomId: raw?.RoomId ?? raw?.roomId ?? "",
        teamAssignment:
          teamAssignmentRaw === "A" || teamAssignmentRaw === "B"
            ? teamAssignmentRaw
            : null,
        userId: raw?.UserId ?? raw?.userId ?? "",
        userName: raw?.UserName ?? raw?.userName ?? "",
      };
    },
    []
  );

  const normalizeLeftRoomGroupPayload = useCallback((raw: any): LeftRoomGroupPayload => {
    return {
      roomId: raw?.RoomId ?? raw?.roomId ?? "",
    };
  }, []);

  useEffect(() => {
    if (!roomId) {
      console.warn("⚠️ MatchRoom SignalR: roomId is required");
      return;
    }

    let isMounted = true;
    let hubConnection: HubConnection | null = null;

    const startConnection = async () => {
      try {
        // Get token first to validate
        const token = await getAuthToken();

        if (!token) {
          console.warn("⚠️ MatchRoom SignalR: No auth token available");
          return;
        }

        console.log("🔌 MatchRoom SignalR: Starting connection...");
        console.log("🔑 Token available:", token.substring(0, 20) + "...");

        // For React Native, use LongPolling as primary transport
        // WebSockets in React Native can have issues with SignalR
        hubConnection = new HubConnectionBuilder()
          .withUrl(MATCH_ROOM_HUB_URL, {
            accessTokenFactory: () => Promise.resolve(token),
            // Use LongPolling for React Native compatibility
            transport: HttpTransportType.LongPolling,
          })
          .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Retry intervals
          .configureLogging(LogLevel.Information)
          .build();

        if (!isMounted) return;

        // ==================== Register Event Listeners ====================

        // Ack: Joined room group (per documentation)
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.JoinedRoom, (raw: any) => {
          const payload = normalizeJoinedRoomGroupPayload(raw);
          console.log("✅ JoinedRoom (group ack):", payload);
          setHasJoinedRoomGroup(true);
          optionsRef.current.onJoinedRoomGroup?.(payload);
        });

        // Ack: Left room group (per documentation)
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.LeftRoom, (raw: any) => {
          const payload = normalizeLeftRoomGroupPayload(raw);
          console.log("🚪 LeftRoom (group ack):", payload);
          setHasJoinedRoomGroup(false);
          optionsRef.current.onLeftRoomGroup?.(payload);
        });
        
        // User joined room
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.UserJoinedRoom, (payload: UserJoinedPayload) => {
          console.log("🏟️ UserJoinedRoom:", payload);
          optionsRef.current.onUserJoinedRoom?.(payload);
        });

        // User left room (includes host transfer logic)
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.UserLeftRoom, (payload: UserLeftPayload) => {
          console.log("🚪 UserLeftRoom:", payload);
          if (payload.isRoomDeleted) {
            console.log("🗑️ Room has been deleted");
          } else if (payload.newHostId) {
            console.log("👑 New host assigned:", payload.newHostId);
          }
          optionsRef.current.onUserLeftRoom?.(payload);
        });

        // Participant updated (team/position change)
        hubConnection.on(
          MATCH_ROOM_HUB_EVENTS.ParticipantUpdated,
          (payload: ParticipantUpdatedPayload) => {
          console.log("🔄 ParticipantUpdated:", payload);
          optionsRef.current.onParticipantUpdated?.(payload);
          }
        );

        // Room status changed (Open -> Full, etc.)
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.RoomStatusChanged, (payload: RoomStatusPayload) => {
          console.log("📊 RoomStatusChanged:", payload);
          optionsRef.current.onRoomStatusChanged?.(payload);
        });

        // Player kicked from room
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.UserKicked, (payload: PlayerKickedPayload) => {
          console.log("⛔ PlayerKicked:", payload);
          optionsRef.current.onPlayerKicked?.(payload);
        });

        // ==================== Room Chat Events ====================

        // Team chat switched
        hubConnection.on(
          "TeamChatSwitched",
          (payload: TeamChatSwitchedPayload) => {
            console.log("💬 TeamChatSwitched:", payload);
            optionsRef.current.onTeamChatSwitched?.(payload);
          },
        );

        // Receive single room message
        hubConnection.on("ReceiveRoomMessage", (payload: RoomMessage) => {
          console.log("📨 ReceiveRoomMessage:", payload);
          optionsRef.current.onReceiveRoomMessage?.(payload);
        });

        // Receive room messages (pagination)
        hubConnection.on(
          "ReceiveRoomMessages",
          (payload: RoomMessagesPayload) => {
            console.log("📨 ReceiveRoomMessages:", payload);
            optionsRef.current.onReceiveRoomMessages?.(payload);
          },
        );

        // User typing in room
        hubConnection.on("RoomUserTyping", (payload: RoomTypingPayload) => {
          console.log("⌨️ RoomUserTyping:", payload);
          optionsRef.current.onRoomUserTyping?.(payload);
        });

        // User stop typing in room
        hubConnection.on(
          "RoomUserStopTyping",
          (payload: RoomStopTypingPayload) => {
            console.log("⌨️ RoomUserStopTyping:", payload);
            optionsRef.current.onRoomUserStopTyping?.(payload);
          },
        );

        // Participant paid deposit
        hubConnection.on(
          MATCH_ROOM_HUB_EVENTS.ParticipantPaid,
          (payload: ParticipantPaidEvent) => {
            console.log("💵 ParticipantPaid:", payload);
            optionsRef.current.onParticipantPaid?.(payload);
          },
        );

        // Formation updated (captain saved formation)
        hubConnection.on(
          MATCH_ROOM_HUB_EVENTS.FormationUpdated,
          (payload: FormationUpdatedPayload) => {
            console.log("⚽ FormationUpdated:", payload);
            optionsRef.current.onFormationUpdated?.(payload);
          },
        );

        // Error from server
        hubConnection.on(MATCH_ROOM_HUB_EVENTS.Error, (payload: any) => {
          console.warn("❌ MatchRoom SignalR Error:", payload);
          optionsRef.current.onError?.(payload);
        });

        // ==================== Connection State Handlers ====================

        hubConnection.onreconnecting((error) => {
          console.log("🔄 MatchRoom SignalR reconnecting...", error);
          setConnectionState(HubConnectionState.Reconnecting);
          setIsConnected(false);
          setHasJoinedRoomGroup(false);
        });

        hubConnection.onreconnected(async (connectionId) => {
          console.log("✅ MatchRoom SignalR reconnected:", connectionId);
          setConnectionState(HubConnectionState.Connected);
          setIsConnected(true);

          // Re-join room group after reconnection
          try {
            const rawTeamAssignment = optionsRef.current.teamAssignment;
            const resolvedTeamAssignment =
              rawTeamAssignment === undefined ? null : rawTeamAssignment;

            console.log("📨 Re-joinRoomGroup (reconnected) with params:", {
              roomId,
              teamAssignment: resolvedTeamAssignment,
            });

            await hubConnection?.invoke(
              MATCH_ROOM_HUB_METHODS.JoinRoomGroup,
              roomId,
              resolvedTeamAssignment
            );
            console.log("✅ Re-joined room group:", roomId);
            setHasJoinedRoomGroup(true);
          } catch (error) {
            console.error("❌ Failed to re-join room group:", error);
            setHasJoinedRoomGroup(false);
          }
        });

        hubConnection.onclose((error) => {
          console.log("🔌 MatchRoom SignalR connection closed", error);
          setConnectionState(HubConnectionState.Disconnected);
          setIsConnected(false);
          setHasJoinedRoomGroup(false);
        });

        // ==================== Start Connection ====================

        setConnectionState(HubConnectionState.Connecting);
        await hubConnection.start();

        if (!isMounted) {
          await hubConnection.stop();
          return;
        }

        console.log("✅ MatchRoom SignalR connected");
        setConnection(hubConnection);
        setConnectionState(HubConnectionState.Connected);
        setIsConnected(true);

        // Join room group để nhận events của room này
        try {
          const rawTeamAssignment = optionsRef.current.teamAssignment;
          const resolvedTeamAssignment =
            rawTeamAssignment === undefined ? null : rawTeamAssignment;

          console.log("📨 JoinRoomGroup (initial) with params:", {
            roomId,
            teamAssignment: resolvedTeamAssignment,
          });

          await hubConnection.invoke(
            MATCH_ROOM_HUB_METHODS.JoinRoomGroup,
            roomId,
            resolvedTeamAssignment
          );
          console.log("✅ Joined room group:", roomId);
          setHasJoinedRoomGroup(true);
        } catch (error) {
          console.error("❌ Failed to join room group:", error);
          setHasJoinedRoomGroup(false);
        }
      } catch (error: any) {
        console.error("❌ MatchRoom SignalR connection error:", error);
        console.error("Error details:", {
          message: error?.message,
          stack: error?.stack?.substring(0, 500),
        });
        setConnectionState(HubConnectionState.Disconnected);
        setIsConnected(false);
        setHasJoinedRoomGroup(false);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      isMounted = false;
      if (hubConnection) {
        // Leave room group trước khi disconnect
        hubConnection
          .invoke(MATCH_ROOM_HUB_METHODS.LeaveRoomGroup, roomId)
          .catch((err) => console.warn("Failed to leave room group:", err))
          .finally(() => {
            hubConnection?.stop();
          });
      }
      setHasJoinedRoomGroup(false);
    };
  }, [roomId]);

  // ==================== Hub Methods (Client -> Server) ====================

  /**
   * Gọi method trên hub (generic)
   */
  const invokeHubMethod = useCallback(
    async (methodName: string, ...args: any[]) => {
      if (!connection || connection.state !== HubConnectionState.Connected) {
        console.warn("⚠️ Cannot invoke hub method: not connected");
        return;
      }
      try {
        await connection.invoke(methodName, ...args);
      } catch (error) {
        console.error(`❌ SignalR invoke error (${methodName}):`, error);
        throw error;
      }
    },
    [connection],
  );

  /**
   * Join room group (per documentation).
   * - If teamAssignment is undefined, invokes JoinRoomGroup(roomId) for backward compatibility.
   * - If teamAssignment is null/"A"/"B", invokes JoinRoomGroup(roomId, teamAssignment).
   */
  const joinRoomGroup = useCallback(
    async (teamAssignment?: "A" | "B" | null) => {
      const rawFromOptions = optionsRef.current.teamAssignment;
      const resolvedTeamAssignment =
        teamAssignment !== undefined ? teamAssignment : rawFromOptions ?? null;

      console.log("📨 joinRoomGroup() manual call with params:", {
        roomId,
        teamAssignment: resolvedTeamAssignment,
      });

      await invokeHubMethod(
        MATCH_ROOM_HUB_METHODS.JoinRoomGroup,
        roomId,
        resolvedTeamAssignment
      );
    },
    [invokeHubMethod, roomId]
  );

  /**
   * Leave room group (per documentation).
   */
  const leaveRoomGroup = useCallback(async () => {
    await invokeHubMethod(MATCH_ROOM_HUB_METHODS.LeaveRoomGroup, roomId);
  }, [invokeHubMethod, roomId]);

  /**
   * Notify server that current user is viewing the room
   * (Optional: for presence tracking)
   */
  const notifyPresence = useCallback(async () => {
    await invokeHubMethod("NotifyPresence", roomId);
  }, [invokeHubMethod, roomId]);

  // ==================== Room Chat Methods ====================

  /**
   * Switch team chat channel
   * @param newTeamAssignment - 'A', 'B', or 'Unassigned'
   */
  const switchTeamChat = useCallback(
    async (newTeamAssignment: "A" | "B" | "Unassigned") => {
      await invokeHubMethod("SwitchTeamChat", roomId, newTeamAssignment);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Send a message to room chat
   * Backend: SendRoomMessage(roomId, channel, messageText) - channel là int
   * @param channel - RoomChatChannel enum (0=All, 1=TeamA, 2=TeamB)
   * @param messageText - Message content
   */
  const sendRoomMessage = useCallback(
    async (channel: RoomChatChannel, messageText: string) => {
      await invokeHubMethod("SendRoomMessage", roomId, channel as number, messageText);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Get room messages (pagination)
   * Backend: GetRoomMessages(roomId, channel, page, pageSize) - channel là int
   * @param channel - RoomChatChannel enum
   * @param page - Page number (default: 1)
   * @param pageSize - Page size (default: 50)
   */
  const getRoomMessages = useCallback(
    async (
      channel: RoomChatChannel,
      page: number = 1,
      pageSize: number = 50,
    ) => {
      await invokeHubMethod("GetRoomMessages", roomId, channel as number, page, pageSize);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Notify that user is typing
   * Backend: RoomTyping(roomId, channel) - channel là int
   * @param channel - RoomChatChannel enum
   */
  const roomTyping = useCallback(
    async (channel: RoomChatChannel) => {
      await invokeHubMethod("RoomTyping", roomId, channel as number);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Notify that user stopped typing
   * Backend: RoomStopTyping(roomId, channel) - channel là int
   * @param channel - RoomChatChannel enum
   */
  const roomStopTyping = useCallback(
    async (channel: RoomChatChannel) => {
      await invokeHubMethod("RoomStopTyping", roomId, channel as number);
    },
    [invokeHubMethod, roomId],
  );

  return {
    connection,
    isConnected,
    hasJoinedRoomGroup,
    connectionState,
    invokeHubMethod,
    joinRoomGroup,
    leaveRoomGroup,
    notifyPresence,
    // Room chat methods
    switchTeamChat,
    sendRoomMessage,
    getRoomMessages,
    roomTyping,
    roomStopTyping,
  };
};
