import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

/**
 * Hook to kick a player from a room (host only)
 * Automatically invalidates room queries on success
 */
export const useKickPlayer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, playerId }: { roomId: string; playerId: string }) =>
      roomsApi.kickPlayer(roomId, playerId),
    
    onSuccess: (_data, variables) => {
      // Invalidate room detail to refetch updated data
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.detail(variables.roomId) 
      });
      
      // Invalidate all room lists to show updated player counts
      queryClient.invalidateQueries({ 
        queryKey: roomsKeys.lists() 
      });
    },
  });
};

