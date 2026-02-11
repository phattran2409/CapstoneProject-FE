import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatKeys } from "../api/chatKeys";
import { getRoomChat, sendChatMessageRoom } from "../api/chatApi";
import type {
  RoomChatDetailData,
  RoomChatMessage,
  SendChatRoomRequestBody,
  SendChatMessageRoomData,
} from "../types/chat.types";
import { usePagination } from "@/shared/hooks/usePagination";
import { RoomChatChannel } from "@/shared/hooks/useMatchRoomSignalR";

interface UseRoomChatMessagesOptions {
  roomId: string;
  channel: RoomChatChannel;
  pageSize?: number;
  enabled?: boolean;
}

export const useRoomChatMessages = ({
  roomId,
  channel,
  pageSize = 50,
  enabled = true,
}: UseRoomChatMessagesOptions) => {
  const pagination = usePagination<RoomChatMessage>({
    queryKey: [...chatKeys.roomChat(roomId), channel],
    fetchFunction: async (page, size) => {
      // Backend expects channel as number (0=General, 1=TeamA, 2=TeamB)
      const result = await getRoomChat(roomId, channel.toString(), page, size);
      return {
        data: result.messages,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enabled && !!roomId,
    onError: (error) => {
      console.error("Error fetching room chat messages:", error);
    },
  });

  return {
    roomChatMessages: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setRoomChatMessages: pagination.setData,
  };
};


export const useSendRoomChatMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendChatRoomRequestBody) =>
      sendChatMessageRoom(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.roomChat(variables.roomId),
      });
    },
  });
};

