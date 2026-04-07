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
    mutationFn: (vars: { roomId: string; reason?: string }) =>
      roomsApi.cancelRoom(vars.roomId, vars.reason),

    onSuccess: (_data, { roomId }) => {
      // Invalidate room detail
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.detail(roomId) 
      });
      
      // Invalidate all room lists
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.lists() 
      });
    },
    onError: (error) => {
      console.error("Failed to cancel room:", error);
      throw error;
    },
  });
};

