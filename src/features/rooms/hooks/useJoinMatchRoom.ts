import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { TeamAssignment } from '../types/room.types';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

interface JoinMatchRoomParams {
  roomId: string;
  teamAssignment: 'A' | 'B';
  position: PlayerPosition;
}

/**
 * Hook để join một match room qua REST API
 * 
 * Flow:
 * 1. Client gọi POST /match-rooms/{roomId}/participants/me
 * 2. Server xử lý và lưu database
 * 3. Server broadcast "UserJoinedRoom" event qua SignalR
 * 4. Tất cả clients trong room nhận được real-time update
 * 
 * @example
 * const { mutate: joinMatchRoom, isPending } = useJoinMatchRoom();
 * 
 * joinMatchRoom(
 *   { roomId: '123', teamAssignment: 'A', position: 'MF' },
 *   {
 *     onSuccess: () => console.log('Joined!'),
 *     onError: (error) => console.error(error),
 *   }
 * );
 */
export const useJoinMatchRoom = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, teamAssignment, position }: JoinMatchRoomParams) =>
      roomsApi.joinMatchRoomParticipant(roomId, teamAssignment, position),

    onSuccess: (_data, variables) => {
      // Invalidate room detail để đảm bảo data đồng bộ
      // (SignalR sẽ update real-time, nhưng invalidate để chắc chắn)
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(variables.roomId),
      });

      // Invalidate match rooms list để cập nhật số người
      queryClient.invalidateQueries({
        queryKey: roomsKeys.matchRooms(),
      });
    },
  });
};
