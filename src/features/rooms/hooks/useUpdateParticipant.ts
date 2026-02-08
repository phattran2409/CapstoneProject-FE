import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { TeamAssignment } from '../types/room.types';

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW' | string;

interface UpdateParticipantParams {
  roomId: string;
  teamAssignment: TeamAssignment;
  position?: PlayerPosition;
}

interface UpdateParticipantResponse {
  participantId: string;
  roomId: string;
  userId: string;
  teamAssignment: TeamAssignment;
  position: string;
  updatedAt: string;
}

/**
 * Hook để cập nhật team assignment và position của participant
 * 
 * Flow:
 * 1. Client gọi PUT /match-rooms/{roomId}/participants/me
 * 2. Server cập nhật team/position của user
 * 3. Server broadcast "ParticipantUpdated" event qua SignalR
 * 4. Tất cả clients trong room thấy user di chuyển sang team mới
 * 
 * Sử dụng sau khi đã join room với useJoinRoomAsUnassigned
 * 
 * @example
 * const { mutate: updateParticipant, isPending } = useUpdateParticipant();
 * 
 * updateParticipant(
 *   { roomId: '123', teamAssignment: 'A', position: 'MF' },
 *   {
 *     onSuccess: () => console.log('Updated to Team A!'),
 *     onError: (error) => console.error(error),
 *   }
 * );
 */
export const useUpdateParticipant = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateParticipantResponse, Error, UpdateParticipantParams>({
    mutationFn: ({ roomId, teamAssignment, position }: UpdateParticipantParams) =>
      roomsApi.updateParticipant(roomId, teamAssignment, position),

    onSuccess: (_data, variables) => {
      // Invalidate room detail để đảm bảo data đồng bộ
      // (SignalR sẽ update real-time, nhưng invalidate để chắc chắn)
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(variables.roomId),
      });
    },
  });
};
