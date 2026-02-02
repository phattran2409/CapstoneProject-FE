import { useEffect, useState, useCallback } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { getAuthToken } from "@/shared/api/client";
import type {
  ConversationDetailData,
  SendChatMessageData,
  MarkAsReadData,
} from "@/features/chat/types/chat.types";

const CHAT_HUB_URL = "https://api.kickify.site/hubs/chat";


export interface UserOnlineStatusPayload {
  userId: string;
  isOnline: boolean;
}

export interface UserTypingPayload {
  userId: string;
  userName: string;
}

export interface UserStopTypingPayload {
  userId: string;
}

export type ReceiveConversationPayload = ConversationDetailData;

export type ReceiveMessagePayload = SendChatMessageData;

export type MessagesReadPayload = MarkAsReadData;

export interface OnlineUsersPayload {
  userIds: string[];
}

export interface ChatErrorPayload {
  message: string;
}

/**
 * Options cho useChatSignalR hook
 */
export interface UseChatSignalROptions {
  // Events từ server - Connection Management
  onUserOnlineStatus?: (payload: UserOnlineStatusPayload) => void;

  // Events từ server - Typing Indicators
  onUserTyping?: (payload: UserTypingPayload) => void;
  onUserStopTyping?: (payload: UserStopTypingPayload) => void;

  // Events từ server - Messages
  onReceiveConversation?: (payload: ReceiveConversationPayload) => void;
  onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
  onMessagesRead?: (payload: MessagesReadPayload) => void;

  // Events từ server - Online Status
  onOnlineUsers?: (payload: OnlineUsersPayload) => void;

  // Error handling
  onError?: (payload: ChatErrorPayload) => void;
}

export const useChatSignalR = (options: UseChatSignalROptions = {}) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const startConnection = async () => {
      try {
        const newConnection = new HubConnectionBuilder()
          .withUrl(CHAT_HUB_URL, {
            accessTokenFactory: async () => (await getAuthToken()) ?? "",
          })
          .withAutomaticReconnect()
          .configureLogging(LogLevel.Information)
          .build();

        if (!isMounted) {
          return;
        }

        // User online / offline
        newConnection.on("UserOnlineStatus", (payload: UserOnlineStatusPayload) => {
          console.log("🟢 UserOnlineStatus:", payload);
          options.onUserOnlineStatus?.(payload);
        });

        // User đang gõ
        newConnection.on("UserTyping", (payload: UserTypingPayload) => {
          console.log("⌨️ UserTyping:", payload);
          options.onUserTyping?.(payload);
        });

        // User dừng gõ
        newConnection.on("UserStopTyping", (payload: UserStopTypingPayload) => {
          console.log("⌨️ UserStopTyping:", payload);
          options.onUserStopTyping?.(payload);
        });

        // Nhận conversation (GetConversation)
        newConnection.on("ReceiveConversation", (payload: ReceiveConversationPayload) => {
          console.log("📨 ReceiveConversation:", payload);
          options.onReceiveConversation?.(payload);
        });

        // Nhận message mới (SendPrivateMessage)
        newConnection.on("ReceiveMessage", (payload: ReceiveMessagePayload) => {
          console.log("📩 ReceiveMessage:", payload);
          options.onReceiveMessage?.(payload);
        });

        // Messages đã được đánh dấu đọc
        newConnection.on("MessagesRead", (payload: MessagesReadPayload) => {
          console.log("✅ MessagesRead:", payload);
          options.onMessagesRead?.(payload);
        });

        // Danh sách online users
        newConnection.on("OnlineUsers", (payload: OnlineUsersPayload) => {
          console.log("👥 OnlineUsers:", payload);
          options.onOnlineUsers?.(payload);
        });

        // Lỗi từ server
        newConnection.on("Error", (payload: ChatErrorPayload) => {
          console.warn("❌ Chat SignalR Error:", payload);
          options.onError?.(payload);
        });

        await newConnection.start();

        if (!isMounted) {
          await newConnection.stop();
          return;
        }

        setConnection(newConnection);
        setIsConnected(true);
      } catch (error) {
        console.error("❌ SignalR connection error:", error);
      }
    };

    startConnection();

    return () => {
      isMounted = false;
      if (connection) {
        connection.stop();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Gọi trực tiếp method bất kỳ trên hub (dùng khi cần tuỳ biến).
   */
  const invokeHubMethod = useCallback(
    async (methodName: string, ...args: any[]) => {
      if (!connection) return;
      try {
        await connection.invoke(methodName, ...args);
      } catch (error) {
        console.error("❌ SignalR invoke error:", error);
      }
    },
    [connection],
  );

  // Helper cụ thể cho các method trong ChatHub
  const sendPrivateMessage = useCallback(
    async (receiverId: string, messageText: string, messageType = 0) => {
      await invokeHubMethod("SendPrivateMessage", receiverId, messageText, messageType);
    },
    [invokeHubMethod],
  );

  const typing = useCallback(
    async (toUserId: string) => {
      await invokeHubMethod("Typing", toUserId);
    },
    [invokeHubMethod],
  );

  const stopTyping = useCallback(
    async (toUserId: string) => {
      await invokeHubMethod("StopTyping", toUserId);
    },
    [invokeHubMethod],
  );

  const markAsRead = useCallback(
    async (fromUserId: string) => {
      await invokeHubMethod("MarkAsRead", fromUserId);
    },
    [invokeHubMethod],
  );

  const getConversation = useCallback(
    async (otherUserId: string, pageNumber = 1, pageSize = 50) => {
      await invokeHubMethod("GetConversation", otherUserId, pageNumber, pageSize);
    },
    [invokeHubMethod],
  );

  const getOnlineStatus = useCallback(
    async (userId: string) => {
      await invokeHubMethod("GetOnlineStatus", userId);
    },
    [invokeHubMethod],
  );

  const getOnlineUsers = useCallback(async () => {
    await invokeHubMethod("GetOnlineUsers");
  }, [invokeHubMethod]);

  return {
    connection,
    isConnected,
    invokeHubMethod,
    // helpers
    sendPrivateMessage,
    typing,
    stopTyping,
    markAsRead,
    getConversation,
    getOnlineStatus,
    getOnlineUsers,
  };
};

