import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

/**
 * Hook to cancel a room (host only)
 * Automatically invalidates room queries on success
 */
export const useCancelRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsApi.cancelRoom(roomId),
    
    onSuccess: (_data, roomId) => {
      // Invalidate room detail
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.detail(roomId) 
      });
      
      // Invalidate all room lists
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.lists() 
      });
    },
  });
};

