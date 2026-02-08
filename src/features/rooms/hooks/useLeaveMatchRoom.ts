import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

/**
 * Hook để rời khỏi một match room qua REST API
 * 
 * Flow:
 * 1. Client gọi POST /match-rooms/{id}/leave
 * 2. Server xử lý và cập nhật database
 * 3. Server broadcast "UserLeftRoom" event qua SignalR
 * 4. Tất cả clients trong room nhận được real-time update
 * 
 * @example
 * const { mutate: leaveMatchRoom, isPending } = useLeaveMatchRoom();
 * 
 * leaveMatchRoom('room-123', {
 *   onSuccess: () => navigation.goBack(),
 *   onError: (error) => Alert.alert('Error', error.message),
 * });
 */
export const useLeaveMatchRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomsApi.leaveMatchRoom(roomId),

    onSuccess: (_data, roomId) => {
      // Invalidate room detail
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Invalidate match rooms list
      queryClient.invalidateQueries({
        queryKey: roomsKeys.matchRooms(),
      });
    },
  });
};
