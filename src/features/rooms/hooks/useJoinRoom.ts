import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { JoinRoomRequest } from '../types/room.types';

/**
 * Hook to join a room
 * Automatically invalidates room queries on success
 * 
 * @example
 * const { mutate: joinRoom, isPending, error } = useJoinRoom();
 * 
 * joinRoom(
 *   { userId: '1', roomId: '123', teamId: 'A' },
 *   {
 *     onSuccess: () => Alert.alert('Success', 'Joined room!'),
 *     onError: (error) => Alert.alert('Error', error.message),
 *   }
 * );
 */
export const useJoinRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: JoinRoomRequest) => roomsApi.joinRoom(request),
    
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

