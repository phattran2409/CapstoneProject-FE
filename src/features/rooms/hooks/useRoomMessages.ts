import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { SendMessageRequest } from '../types/room.types';

/**
 * Hook to fetch room messages
 * 
 * @param roomId - Room ID to fetch messages for
 * 
 * @example
 * const { data: messages, isLoading } = useRoomMessages('123');
 */
export const useRoomMessages = (roomId: string) => {
  return useQuery({
    queryKey: roomsKeys.messages(roomId),
    queryFn: () => roomsApi.getRoomMessages(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000,  // 30 seconds (messages should be fresh)
    gcTime: 5 * 60 * 1000,  // 5 minutes
  });
};

/**
 * Hook to send a message
 * Automatically adds message to cache optimistically
 * 
 * @example
 * const { mutate: sendMessage, isPending } = useSendMessage();
 * 
 * sendMessage({ roomId: '123', userId: '1', message: 'Hello!' });
 */
export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SendMessageRequest) => roomsApi.sendMessage(request),
    
    // Optimistic update
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: roomsKeys.messages(newMessage.roomId) 
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData(
        roomsKeys.messages(newMessage.roomId)
      );

      // Optimistically add new message
      queryClient.setQueryData(
        roomsKeys.messages(newMessage.roomId),
        (old: any) => [
          ...(old || []),
          {
            id: `temp-${Date.now()}`,
            ...newMessage,
            createdAt: new Date().toISOString(),
          },
        ]
      );

      return { previousMessages };
    },

    // On error, rollback
    onError: (_err, newMessage, context) => {
      queryClient.setQueryData(
        roomsKeys.messages(newMessage.roomId),
        context?.previousMessages
      );
    },

    // Always refetch after success/error
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.messages(variables.roomId) 
      });
    },
  });
};

