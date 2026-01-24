import { useQuery, useMutation } from "@tanstack/react-query";
import { chatKeys } from "../api/chatKeys";
import { getConversationMessages, sendChatMessage, markChatAsRead } from "../api/chatApi";
import type { SendChatRequestBody } from "../types/chat.types";

/**
 * Lấy danh sách tin nhắn với 1 user (conversation detail)
 * GET /api/chat/conversation/{otherUserId}?pageNumber=&pageSize=
 */
export const useChatMessages = (
  otherUserId: string,
  pageNumber = 1,
  pageSize = 50,
) => {
  return useQuery({
    queryKey: [...chatKeys.conversation(otherUserId), { pageNumber, pageSize }],
    queryFn: () => getConversationMessages(otherUserId, pageNumber, pageSize),
    enabled: !!otherUserId,
  });
};

/**
 * Gửi tin nhắn sử dụng API thực tế: POST /api/chat/send
 */
export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: (payload: SendChatRequestBody) => sendChatMessage(payload),
  });
};

/**
 * Đánh dấu đã đọc tin nhắn bằng API thực tế: POST /api/chat/read/{fromUserId}
 * fromUserId: id của NGƯỜI ĐÃ GỬI tin (đối thủ trong đoạn chat).
 */
export const useMarkChatAsRead = () => {
  return useMutation({
    mutationFn: (fromUserId: string) => markChatAsRead(fromUserId),
  });
};
