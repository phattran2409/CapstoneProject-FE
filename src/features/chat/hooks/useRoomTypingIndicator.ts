import { useState, useRef, useCallback, useMemo } from "react";
import type {
  RoomChatChannel,
  RoomTypingPayload,
  RoomStopTypingPayload,
} from "@/shared/hooks/useMatchRoomSignalR";

interface UseRoomTypingIndicatorProps {
  currentChannel: RoomChatChannel;
  currentUserId: string;
  roomTyping: (channel: RoomChatChannel) => Promise<void>;
  roomStopTyping: (channel: RoomChatChannel) => Promise<void>;
  isSignalRReady: boolean;
}

export const useRoomTypingIndicator = ({
  currentChannel,
  currentUserId,
  roomTyping,
  roomStopTyping,
  isSignalRReady,
}: UseRoomTypingIndicatorProps) => {
  const [typingUsers, setTypingUsers] = useState<
    Map<string, RoomTypingPayload>
  >(new Map());
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const lastTypingTimeRef = useRef<number>(0);

  // Handle user typing event from SignalR
  const handleUserTyping = useCallback(
    (payload: RoomTypingPayload) => {
      if (
        payload.channel === (currentChannel as number) &&
        payload.userId !== currentUserId
      ) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.set(payload.userId, payload);
          return newMap;
        });

        // Clear existing timeout
        if (typingTimeoutRef.current.has(payload.userId)) {
          clearTimeout(typingTimeoutRef.current.get(payload.userId)!);
        }

        // Set new timeout to auto-remove typing indicator
        const timeout = setTimeout(() => {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(payload.userId);
            return newMap;
          });
          typingTimeoutRef.current.delete(payload.userId);
        }, 3000);

        typingTimeoutRef.current.set(payload.userId, timeout);
      }
    },
    [currentChannel, currentUserId],
  );

  // Handle user stop typing event from SignalR
  const handleUserStopTyping = useCallback(
    (payload: RoomStopTypingPayload) => {
      if (
        payload.channel === (currentChannel as number) &&
        payload.userId !== currentUserId
      ) {
        setTypingUsers((prev) => {
          const newMap = new Map(prev);
          newMap.delete(payload.userId);
          return newMap;
        });

        if (typingTimeoutRef.current.has(payload.userId)) {
          clearTimeout(typingTimeoutRef.current.get(payload.userId)!);
          typingTimeoutRef.current.delete(payload.userId);
        }
      }
    },
    [currentChannel, currentUserId],
  );

  // Handle text change and send typing indicators
  const handleTextChange = useCallback(
    (text: string, onTextChange: (text: string) => void) => {
      onTextChange(text);

      if (!isSignalRReady) return;

      const now = Date.now();
      // Send typing indicator every 2 seconds
      if (now - lastTypingTimeRef.current > 2000) {
        if (text.trim().length > 0) {
          roomTyping(currentChannel).catch((error) => {
            console.error("❌ Failed to send typing indicator:", error);
          });
          lastTypingTimeRef.current = now;
        }
      }

      // Clear existing timeout
      if (typingTimeoutRef.current.has("self")) {
        clearTimeout(typingTimeoutRef.current.get("self")!);
      }

      // Auto stop typing after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        if (isSignalRReady) {
          roomStopTyping(currentChannel).catch((error) => {
            console.error("❌ Failed to send stop typing indicator:", error);
          });
        }
      }, 3000);

      typingTimeoutRef.current.set("self", timeout);
    },
    [isSignalRReady, currentChannel, roomTyping, roomStopTyping],
  );

  // Stop typing indicator
  const stopTyping = useCallback(() => {
    if (isSignalRReady) {
      roomStopTyping(currentChannel).catch((error) => {
        console.error("❌ Failed to send stop typing indicator:", error);
      });
    }
  }, [isSignalRReady, currentChannel, roomStopTyping]);

  // Cleanup timeouts
  const cleanup = useCallback(() => {
    typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
    typingTimeoutRef.current.clear();
  }, []);

  // Get typing indicator text
  const typingIndicatorText = useMemo(() => {
    if (typingUsers.size === 0) return null;
    const users = Array.from(typingUsers.values());
    if (users.length === 1) {
      return `${users[0].userName} đang gõ...`;
    }
    return `${users.length} người đang gõ...`;
  }, [typingUsers]);

  return {
    typingUsers,
    typingIndicatorText,
    handleUserTyping,
    handleUserStopTyping,
    handleTextChange,
    stopTyping,
    cleanup,
  };
};
