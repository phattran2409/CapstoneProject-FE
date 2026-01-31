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
  
  // Events từ server
  onUserJoinedRoom?: (payload: UserJoinedPayload) => void;
  onUserLeftRoom?: (payload: UserLeftPayload) => void;
  onParticipantUpdated?: (payload: ParticipantUpdatedPayload) => void;
  onRoomStatusChanged?: (payload: RoomStatusPayload) => void;
  onPlayerKicked?: (payload: PlayerKickedPayload) => void;
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
  teamAssignment?: 'A' | 'B' | 'Unassigned';
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
  teamAssignment: 'A' | 'B' | 'Unassigned';
  position?: string | null;
  updatedAt: string;
}

/**
 * Payload khi trạng thái room thay đổi
 * Theo API: RoomStatusChanged event
 */
export interface RoomStatusPayload {
  roomId: string;
  status: 'Open' | 'Full' | 'Closed' | 'InProgress' | 'Completed' | 'Cancelled';
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
    HubConnectionState.Disconnected
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
        hubConnection.on("ParticipantUpdated", (payload: ParticipantUpdatedPayload) => {
          console.log("🔄 ParticipantUpdated:", payload);
          optionsRef.current.onParticipantUpdated?.(payload);
        });

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
        hubConnection.invoke("LeaveRoomGroup", roomId)
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
    [connection]
  );

  /**
   * Notify server that current user is viewing the room
   * (Optional: for presence tracking)
   */
  const notifyPresence = useCallback(async () => {
    await invokeHubMethod("NotifyPresence", roomId);
  }, [invokeHubMethod, roomId]);

  return {
    connection,
    isConnected,
    connectionState,
    invokeHubMethod,
    notifyPresence,
  };
};
