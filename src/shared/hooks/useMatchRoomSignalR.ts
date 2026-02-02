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

/**
 * SignalR events từ MatchRoom Hub
 */
export interface UseMatchRoomSignalROptions {
  // Room ID để join vào group
  roomId: string;

  // Events từ server - Room management
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
  onRoomUserStopTyping?: (payload: RoomTypingPayload) => void;

  onError?: (payload: any) => void;
}

// ==================== Payload Types ====================

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
}

/**
 * Room Chat Channel enum
 */
export enum RoomChatChannel {
  All = 0,
  TeamA = 1,
  TeamB = 2,
}

/**
 * Payload khi user switch team chat channel
 */
export interface TeamChatSwitchedPayload {
  roomId: string;
  teamAssignment: "A" | "B" | "Unassigned";
}

/**
 * Room message object
 */
export interface RoomMessage {
  messageId: string;
  roomId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  channel: RoomChatChannel;
  messageText: string;
  sentAt: string;
}

/**
 * Payload khi nhận danh sách messages
 */
export interface RoomMessagesPayload {
  messages: RoomMessage[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasMore: boolean;
}

/**
 * Payload khi user đang typing
 */
export interface RoomTypingPayload {
  roomId: string;
  channel: RoomChatChannel;
  userId: string;
  userName: string;
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
  const [connectionState, setConnectionState] = useState<HubConnectionState>(
    HubConnectionState.Disconnected,
  );

  // Use ref to store options to avoid stale closure issues
  const optionsRef = useRef(options);
  optionsRef.current = options;

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

        // User joined room
        hubConnection.on("UserJoinedRoom", (payload: UserJoinedPayload) => {
          console.log("🏟️ UserJoinedRoom:", payload);
          optionsRef.current.onUserJoinedRoom?.(payload);
        });

        // User left room (includes host transfer logic)
        hubConnection.on("UserLeftRoom", (payload: UserLeftPayload) => {
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
          "ParticipantUpdated",
          (payload: ParticipantUpdatedPayload) => {
            console.log("🔄 ParticipantUpdated:", payload);
            optionsRef.current.onParticipantUpdated?.(payload);
          },
        );

        // Room status changed (Open -> Full, etc.)
        hubConnection.on("RoomStatusChanged", (payload: RoomStatusPayload) => {
          console.log("📊 RoomStatusChanged:", payload);
          optionsRef.current.onRoomStatusChanged?.(payload);
        });

        // Player kicked from room
        hubConnection.on("PlayerKicked", (payload: PlayerKickedPayload) => {
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
        hubConnection.on("RoomUserStopTyping", (payload: RoomTypingPayload) => {
          console.log("⌨️ RoomUserStopTyping:", payload);
          optionsRef.current.onRoomUserStopTyping?.(payload);
        });

        // Error from server
        hubConnection.on("Error", (payload: any) => {
          console.warn("❌ MatchRoom SignalR Error:", payload);
          optionsRef.current.onError?.(payload);
        });

        // ==================== Connection State Handlers ====================

        hubConnection.onreconnecting((error) => {
          console.log("🔄 MatchRoom SignalR reconnecting...", error);
          setConnectionState(HubConnectionState.Reconnecting);
          setIsConnected(false);
        });

        hubConnection.onreconnected(async (connectionId) => {
          console.log("✅ MatchRoom SignalR reconnected:", connectionId);
          setConnectionState(HubConnectionState.Connected);
          setIsConnected(true);

          // Re-join room group after reconnection
          try {
            await hubConnection?.invoke("JoinRoomGroup", roomId);
            console.log("✅ Re-joined room group:", roomId);
          } catch (error) {
            console.error("❌ Failed to re-join room group:", error);
          }
        });

        hubConnection.onclose((error) => {
          console.log("🔌 MatchRoom SignalR connection closed", error);
          setConnectionState(HubConnectionState.Disconnected);
          setIsConnected(false);
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
          await hubConnection.invoke("JoinRoomGroup", roomId);
          console.log("✅ Joined room group:", roomId);
        } catch (error) {
          console.error("❌ Failed to join room group:", error);
        }
      } catch (error: any) {
        console.error("❌ MatchRoom SignalR connection error:", error);
        console.error("Error details:", {
          message: error?.message,
          stack: error?.stack?.substring(0, 500),
        });
        setConnectionState(HubConnectionState.Disconnected);
        setIsConnected(false);
      }
    };

    startConnection();

    // Cleanup
    return () => {
      isMounted = false;
      if (hubConnection) {
        // Leave room group trước khi disconnect
        hubConnection
          .invoke("LeaveRoomGroup", roomId)
          .catch((err) => console.warn("Failed to leave room group:", err))
          .finally(() => {
            hubConnection?.stop();
          });
      }
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
   * @param channel - RoomChatChannel (0=All, 1=TeamA, 2=TeamB)
   * @param messageText - Message content
   */
  const sendRoomMessage = useCallback(
    async (channel: RoomChatChannel, messageText: string) => {
      await invokeHubMethod("SendRoomMessage", roomId, channel, messageText);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Get room messages (pagination)
   * @param channel - RoomChatChannel
   * @param page - Page number (default: 1)
   * @param pageSize - Page size (default: 50)
   */
  const getRoomMessages = useCallback(
    async (
      channel: RoomChatChannel,
      page: number = 1,
      pageSize: number = 50,
    ) => {
      await invokeHubMethod("GetRoomMessages", roomId, channel, page, pageSize);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Notify that user is typing
   * @param channel - RoomChatChannel
   */
  const roomTyping = useCallback(
    async (channel: RoomChatChannel) => {
      await invokeHubMethod("RoomTyping", roomId, channel);
    },
    [invokeHubMethod, roomId],
  );

  /**
   * Notify that user stopped typing
   * @param channel - RoomChatChannel
   */
  const roomStopTyping = useCallback(
    async (channel: RoomChatChannel) => {
      await invokeHubMethod("RoomStopTyping", roomId, channel);
    },
    [invokeHubMethod, roomId],
  );

  return {
    connection,
    isConnected,
    connectionState,
    invokeHubMethod,
    notifyPresence,
    // Room chat methods
    switchTeamChat,
    sendRoomMessage,
    getRoomMessages,
    roomTyping,
    roomStopTyping,
  };
};
