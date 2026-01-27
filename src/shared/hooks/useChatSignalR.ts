import { useEffect, useState, useCallback } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { getAuthToken } from "@/shared/api/client";

const CHAT_HUB_URL = "https://api.kickify.site/hubs/chat";

export interface UseChatSignalROptions {
  // /chatHub events từ server
  onUserOnlineStatus?: (payload: any) => void; // "UserOnlineStatus"
  onUserTyping?: (payload: any) => void; // "UserTyping"
  onUserStopTyping?: (payload: any) => void; // "UserStopTyping"
  onReceiveConversation?: (payload: any) => void; // "ReceiveConversation"
  onReceiveMessage?: (payload: any) => void; // "ReceiveMessage"
  onMessagesRead?: (payload: any) => void; // "MessagesRead"
  onOnlineUsers?: (payload: any) => void; // "OnlineUsers"
  onError?: (payload: any) => void; // "Error"
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
        newConnection.on("UserOnlineStatus", (payload: any) => {
          options.onUserOnlineStatus?.(payload);
        });

        // User đang gõ
        newConnection.on("UserTyping", (payload: any) => {
          options.onUserTyping?.(payload);
        });

        // User dừng gõ
        newConnection.on("UserStopTyping", (payload: any) => {
          options.onUserStopTyping?.(payload);
        });

        // Nhận conversation (GetConversation)
        newConnection.on("ReceiveConversation", (payload: any) => {
          options.onReceiveConversation?.(payload);
        });

        // Một số event khác từ backend (log hiển thị dưới dạng 'messagesread', 'receivemessage')
        newConnection.on("MessagesRead", (payload: any) => {
          console.log("📩 MessagesRead:", payload);
          options.onMessagesRead?.(payload);
        });
        newConnection.on("ReceiveMessage", (payload: any) => {
          console.log("📩 ReceiveMessage:", payload);
          options.onReceiveMessage?.(payload);
        });

        // Danh sách online
        newConnection.on("OnlineUsers", (payload: any) => {
          options.onOnlineUsers?.(payload);
        });

        // Lỗi từ server
        newConnection.on("Error", (payload: any) => {
          console.warn("SignalR Error event:", payload);
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

