import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

interface JoinRoomResponse {
  participantId: string;
  roomId: string;
  userId: string;
  filledSlots: number;
  totalSlots: number;
  joinDate: string;
}

/**
 * Hook để join một match room với status Unassigned
 * 
 * Flow:
 * 1. Client gọi POST /match-rooms/{roomId}/join
 * 2. Server thêm user vào room với status Unassigned
 * 3. Server broadcast "UserJoinedRoom" event qua SignalR
 * 4. Tất cả clients trong room nhận được toast notification
 * 
 * Sau khi join, user có thể chọn Team A/B bằng useUpdateParticipant hook
 * 
 * @example
 * const { mutate: joinRoom, isPending } = useJoinRoomAsUnassigned();
 * 
 * joinRoom(roomId, {
 *   onSuccess: (data) => {
 *     console.log('Joined as Unassigned!', data.participantId);
 *     navigation.navigate('RoomInformation', { roomId });
 *   },
 *   onError: (error) => console.error(error),
 * });
 */
export const useJoinRoomAsUnassigned = () => {
  const queryClient = useQueryClient();

  return useMutation<JoinRoomResponse, Error, string>({
    mutationFn: (roomId: string) => roomsApi.joinMatchRoom({ roomId }),

    onSuccess: (_data, roomId) => {
      // Invalidate room detail để đảm bảo data đồng bộ
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(roomId),
      });

      // Invalidate match rooms list để cập nhật số người
      queryClient.invalidateQueries({
        queryKey: roomsKeys.matchRooms(),
      });
    },
  });
};
