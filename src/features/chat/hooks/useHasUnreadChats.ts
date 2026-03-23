import { useQuery } from "@tanstack/react-query";
import { chatKeys } from "../api/chatKeys";
import { getConversations } from "../api/chatApi";

/**
 * Hook nhỏ gọn chỉ để kiểm tra có cuộc trò chuyện nào có tin nhắn chưa đọc không.
 * Gọi API lấy trang đầu (pageSize nhỏ) rồi kiểm tra unreadCount > 0.
 */
export const useHasUnreadChats = () => {
  const { data } = useQuery({
    queryKey: [...chatKeys.conversations(), "__unread_check__"],
    queryFn: () => getConversations({ page: 1, pageSize: 20 }),
    staleTime: 30 * 1000, // 30 giây
    select: (result) =>
      result.conversations.some((conv) => conv.unreadCount > 0),
  });

  return data ?? false;
};
