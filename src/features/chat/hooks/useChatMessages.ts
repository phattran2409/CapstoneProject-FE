import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../api/chatKeys";
import {
  getConversationMessages,
  sendChatMessage,
  markChatAsRead,
  getConversations,
} from "../api/chatApi";
import type {
  ConversationMessage,
  ConversationSummary,
  SendChatRequestBody,
} from "../types/chat.types";
import { usePagination } from "@/shared/hooks/usePagination";

interface UseChatMessagesOptions {
  otherUserId: string;
  pageNumber?: number;
  pageSize?: number;
}

interface UseChatConversationsOptions {
  pageSize?: number;
}

export const useChatConversations = ({
  pageSize = 20,
}: UseChatConversationsOptions = {}) => {
  const pagination = usePagination<ConversationSummary>({
    queryKey: chatKeys.conversations(),
    fetchFunction: async (page, size) => {
      const result = await getConversations({ page, pageSize: size });
      return {
        data: result.conversations,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled: true,
    onError: (error) => {
      console.error("Error fetching chat messages:", error);
    },
  });
  return {
    chatConversations: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setChatConversations: pagination.setData,
  };
};

export const useChatMessages = ({
  otherUserId,
  pageSize = 50,
}: UseChatMessagesOptions) => {
  const pagination = usePagination<ConversationMessage>({
    queryKey: chatKeys.conversation(otherUserId),
    fetchFunction: async (page, size) => {
      const result = await getConversationMessages(otherUserId, page, size);
      return {
        data: result.messages,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled: !!otherUserId,
    onError: (error) => {
      console.error("Error fetching chat messages:", error);
    },
  });
  return {
    chatMessages: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setChatMessages: pagination.setData,
  };
};

/**
 * Gửi tin nhắn sử dụng API thực tế: POST /api/chat/send
 */
export const useSendChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendChatRequestBody) => sendChatMessage(payload),
    onSuccess: (_data, variables) => {
      // Refetch đoạn hội thoại với receiver này
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(variables.receiverId),
      });
      // Cập nhật lại danh sách conversations (lastMessage, unreadCount,...)
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
};

/**
 * Đánh dấu đã đọc tin nhắn bằng API thực tế: POST /api/chat/read/{fromUserId}
 * fromUserId: id của NGƯỜI ĐÃ GỬI tin (đối thủ trong đoạn chat).
 */
export const useMarkChatAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fromUserId: string) => markChatAsRead(fromUserId),
    onSuccess: (_data, fromUserId) => {
      // Invalidate queries để refetch với pagination
      // usePagination sẽ tự động cập nhật accumulatedData khi refetch
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversation(fromUserId),
        exact: false, // Invalidate tất cả pages
      });

      // Cập nhật lại danh sách conversations (unreadCount)
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversations(),
      });
    },
  });
};
