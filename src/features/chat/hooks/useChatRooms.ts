import { useQuery } from "@tanstack/react-query";
import { chatKeys } from "../api/chatKeys";
import { getConversations, getConversationMessages } from "../api/chatApi";

/**
 * Lấy danh sách các cuộc trò chuyện hiện có
 * GET /api/chat/conversations?page=&pageSize=
 */
export const useChatRooms = (page = 1, pageSize = 20) => {
  return useQuery({
    queryKey: [...chatKeys.conversations(), { page, pageSize }],
    queryFn: () => getConversations({ page, pageSize }),
  });
};

/**
 * Lấy nội dung cuộc trò chuyện với 1 user cụ thể
 * GET /api/chat/conversation/{otherUserId}?pageNumber=&pageSize=
 *  - otherUserId: id của người còn lại trong cuộc trò chuyện
 */
export const useChatRoom = (
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

