import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/api/chatKeys";
import type { ConversationMessage } from "@/features/chat/types/chat.types";
import type { UseChatSignalROptions } from "./useChatSignalR";

export interface UseChatSignalRHandlersOptions {
  // Conversation info
  otherUserId: string;
  currentUserId?: string;
  chatName?: string;

  // Message management
  setChatMessages: React.Dispatch<React.SetStateAction<ConversationMessage[]>>;

  // Typing indicator
  setIsOtherUserTyping?: (isTyping: boolean) => void;
  typingTimeoutRef?: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;

  // Online status
  setIsOtherUserOnline?: (isOnline: boolean) => void;

  // Auto scroll (optional)
  isAtBottomRef?: React.MutableRefObject<boolean>;
  messageListRef?: {
    scrollToBottom: (animated?: boolean) => void;
  };

  // Custom callbacks (optional - để override hoặc extend)
  onReceiveMessage?: (payload: any) => void;
  onUserTyping?: (payload: any) => void;
  onUserStopTyping?: (payload: any) => void;
  onUserOnlineStatus?: (payload: any) => void;
  onOnlineUsers?: (payload: any) => void;
  onMessagesRead?: (payload: any) => void;
}

/**
 * Hook tạo các SignalR handlers phổ biến cho chat messages
 * Có thể tái sử dụng ở nhiều màn hình khác nhau
 */
export const useChatSignalRHandlers = (
  options: UseChatSignalRHandlersOptions,
): UseChatSignalROptions => {
  const {
    otherUserId,
    currentUserId,
    chatName,
    setChatMessages,
    setIsOtherUserTyping,
    typingTimeoutRef,
    setIsOtherUserOnline,
    isAtBottomRef,
    messageListRef,
    onReceiveMessage: customOnReceiveMessage,
    onUserTyping: customOnUserTyping,
    onUserStopTyping: customOnUserStopTyping,
    onUserOnlineStatus: customOnUserOnlineStatus,
    onOnlineUsers: customOnOnlineUsers,
    onMessagesRead: customOnMessagesRead,
  } = options;

  const queryClient = useQueryClient();
  const defaultTypingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeTypingTimeoutRef = typingTimeoutRef || defaultTypingTimeoutRef;

  const onReceiveMessage = useCallback(
    (payload: any) => {
      console.log("📩 ReceiveMessage:", payload);

      // Kiểm tra nếu tin nhắn này dành cho conversation hiện tại
      if (
        payload.senderId === otherUserId ||
        payload.receiverId === otherUserId
      ) {
        // Tạo message mới từ payload
        const newMessage: ConversationMessage = {
          messageId: payload.messageId || `temp-${Date.now()}`,
          senderId: payload.senderId,
          senderName: payload.senderName || chatName || "",
          senderAvatarUrl: payload.senderAvatarUrl || null,
          messageText: payload.messageText || payload.message,
          messageType: payload.messageType || "Text",
          // Nếu là tin nhắn của mình gửi đi, mặc định chưa đọc (người nhận chưa đọc)
          // Nếu là tin nhắn nhận được, dùng giá trị từ payload hoặc false
          isRead:
            payload.senderId === currentUserId
              ? false
              : payload.isRead || false,
          isEdited: payload.isEdited || false,
          isMine: payload.senderId === currentUserId,
          sentAt: payload.sentAt || new Date().toISOString(),
        };

        // Cập nhật trực tiếp vào accumulatedData của pagination
        setChatMessages((prevMessages) => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate)
          const messageExists = prevMessages.some(
            (m) => m.messageId === newMessage.messageId,
          );
          if (messageExists) return prevMessages;

          // Thêm tin nhắn mới vào đầu mảng
          const updatedMessages = [...prevMessages, newMessage];

          // Auto scroll nếu đang ở bottom
          if (isAtBottomRef?.current && messageListRef) {
            setTimeout(() => {
              messageListRef.scrollToBottom(true);
            }, 100);
          }

          return updatedMessages;
        });

        // Cập nhật danh sách conversations
        queryClient.invalidateQueries({
          queryKey: chatKeys.conversations(),
        });
      }

      // Call custom callback nếu có
      customOnReceiveMessage?.(payload);
    },
    [
      otherUserId,
      currentUserId,
      chatName,
      setChatMessages,
      queryClient,
      isAtBottomRef,
      messageListRef,
      customOnReceiveMessage,
    ],
  );

  const onUserTyping = useCallback(
    (payload: any) => {
      // Kiểm tra nếu người đang gõ là người đang chat với
      if (payload.userId === otherUserId && setIsOtherUserTyping) {
        setIsOtherUserTyping(true);
        // Tự động tắt typing indicator sau 3 giây
        if (activeTypingTimeoutRef.current) {
          clearTimeout(activeTypingTimeoutRef.current);
        }
        activeTypingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
        }, 3000);
      }

      // Call custom callback nếu có
      customOnUserTyping?.(payload);
    },
    [otherUserId, setIsOtherUserTyping, activeTypingTimeoutRef, customOnUserTyping],
  );

  const onUserStopTyping = useCallback(
    (payload: any) => {
      if (payload.userId === otherUserId && setIsOtherUserTyping) {
        setIsOtherUserTyping(false);
        if (activeTypingTimeoutRef.current) {
          clearTimeout(activeTypingTimeoutRef.current);
        }
      }

      // Call custom callback nếu có
      customOnUserStopTyping?.(payload);
    },
    [otherUserId, setIsOtherUserTyping, activeTypingTimeoutRef, customOnUserStopTyping],
  );

  const onUserOnlineStatus = useCallback(
    (payload: any) => {
      // Kiểm tra nếu status update là của người đang chat
      if (payload.userId === otherUserId && setIsOtherUserOnline) {
        setIsOtherUserOnline(payload.isOnline || false);
      }

      // Call custom callback nếu có
      customOnUserOnlineStatus?.(payload);
    },
    [otherUserId, setIsOtherUserOnline, customOnUserOnlineStatus],
  );

  const onOnlineUsers = useCallback(
    (payload: any) => {
      if (setIsOtherUserOnline) {
        // payload có thể là array of user IDs hoặc object
        if (Array.isArray(payload)) {
          setIsOtherUserOnline(payload.includes(otherUserId));
        } else if (payload.users && Array.isArray(payload.users)) {
          setIsOtherUserOnline(payload.users.includes(otherUserId));
        }
      }

      // Call custom callback nếu có
      customOnOnlineUsers?.(payload);
    },
    [otherUserId, setIsOtherUserOnline, customOnOnlineUsers],
  );

  const onMessagesRead = useCallback(
    (payload: any) => {
      console.log("📩 MessagesRead event:", payload);

      // Kiểm tra nếu event này liên quan đến conversation hiện tại
      // fromUserId là người đã gửi tin nhắn (người mà tin nhắn của họ đã được đọc)
      const fromUserId = payload.fromUserId || payload.userId;
      if (fromUserId === otherUserId) {
        // Người đang chat với đã đọc tin nhắn của mình
        // Cập nhật trực tiếp vào accumulatedData của pagination
        setChatMessages((prevMessages) =>
          prevMessages.map((msg) => ({
            ...msg,
            // Cập nhật isRead cho tin nhắn của mình (isMine: true)
            isRead: msg.isMine ? true : msg.isRead,
          })),
        );
      }

      // Call custom callback nếu có
      customOnMessagesRead?.(payload);
    },
    [otherUserId, setChatMessages, customOnMessagesRead],
  );

  return {
    onReceiveMessage,
    onUserTyping,
    onUserStopTyping,
    onUserOnlineStatus,
    onOnlineUsers,
    onMessagesRead,
  };
};

