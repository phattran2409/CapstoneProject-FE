import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { CreateRoomRequest } from '../types/room.types';

/**
 * Hook to create a new room
 * Automatically invalidates room lists on success
 * 
 * @example
 * const { mutate: createRoom, isPending } = useCreateRoom();
 * 
 * createRoom(
 *   {
 *     format: '7vs7',
 *     datetime: '2024-12-30T18:00:00Z',
 *     venueId: '1',
 *     totalPlayers: 14,
 *     pricePerPlayer: 100000,
 *     description: 'Friendly match',
 *   },
 *   {
 *     onSuccess: (room) => {
 *       Alert.alert('Success', 'Room created!');
 *       navigation.navigate('RoomDetail', { roomId: room.id });
 *     },
 *   }
 * );
 */
export const useCreateRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRoomRequest) => roomsApi.createRoom(request),
    
    onSuccess: () => {
      // Invalidate all match room queries (prefix match để bao phủ mọi filter + pagination)
      queryClient.invalidateQueries({
        queryKey: roomsKeys.matchRooms(),
        exact: false,
      });
      queryClient.invalidateQueries({
        queryKey: roomsKeys.myRoomsBase(),
        exact: false,
      });
    },
  });
};

