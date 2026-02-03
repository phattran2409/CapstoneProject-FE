import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "@/features/chat/api/chatKeys";
import type { ConversationMessage } from "@/features/chat/types/chat.types";
import type {
  UseChatSignalROptions,
  UserTypingPayload,
  UserStopTypingPayload,
  UserOnlineStatusPayload,
  OnlineUsersPayload,
  ReceiveMessagePayload,
  MessagesReadPayload,
} from "./useChatSignalR";

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
  onReceiveMessage?: (payload: ReceiveMessagePayload) => void;
  onUserTyping?: (payload: UserTypingPayload) => void;
  onUserStopTyping?: (payload: UserStopTypingPayload) => void;
  onUserOnlineStatus?: (payload: UserOnlineStatusPayload) => void;
  onOnlineUsers?: (payload: OnlineUsersPayload) => void;
  onMessagesRead?: (payload: MessagesReadPayload) => void;
}


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
    (payload: ReceiveMessagePayload) => {
      console.log("📩 ReceiveMessage:", payload);

      // Kiểm tra nếu tin nhắn này dành cho conversation hiện tại
      if (
        payload.senderId === otherUserId ||
        payload.receiverId === otherUserId
      ) {
        // Tạo message mới từ payload (SendChatMessageData)
        const newMessage: ConversationMessage = {
          messageId: payload.messageId,
          senderId: payload.senderId,
          senderName: chatName || "", // SendChatMessageData không có senderName, dùng chatName
          senderAvatarUrl: null, // SendChatMessageData không có senderAvatarUrl
          messageText: payload.messageText,
          messageType: payload.messageType,
          // Nếu là tin nhắn của mình gửi đi, mặc định chưa đọc (người nhận chưa đọc)
          // Nếu là tin nhắn nhận được, dùng giá trị từ payload hoặc false
          isRead: payload.senderId === currentUserId ? false : false,
          isEdited: false, // SendChatMessageData không có isEdited
          isMine: payload.senderId === currentUserId,
          sentAt: payload.sentAt,
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
    (payload: UserTypingPayload) => {
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
    (payload: UserStopTypingPayload) => {
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
    (payload: UserOnlineStatusPayload) => {
      // Kiểm tra nếu status update là của người đang chat
      if (payload.userId === otherUserId && setIsOtherUserOnline) {
        setIsOtherUserOnline(payload.isOnline);
      }

      // Call custom callback nếu có
      customOnUserOnlineStatus?.(payload);
    },
    [otherUserId, setIsOtherUserOnline, customOnUserOnlineStatus],
  );

  const onOnlineUsers = useCallback(
    (payload: OnlineUsersPayload) => {
      if (setIsOtherUserOnline) {
        // payload.userIds là array of user IDs
        setIsOtherUserOnline(payload.userIds.includes(otherUserId));
      }

      // Call custom callback nếu có
      customOnOnlineUsers?.(payload);
    },
    [otherUserId, setIsOtherUserOnline, customOnOnlineUsers],
  );

  const onMessagesRead = useCallback(
    (payload: MessagesReadPayload) => {
      console.log("📩 MessagesRead event:", payload);

      // Kiểm tra nếu event này liên quan đến conversation hiện tại
      // fromUserId là người đã gửi tin nhắn (người mà tin nhắn của họ đã được đọc)
      if (payload.fromUserId === otherUserId) {
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

