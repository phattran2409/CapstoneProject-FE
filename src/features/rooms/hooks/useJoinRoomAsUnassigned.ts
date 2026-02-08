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

export type JoinRoomAsUnassignedArgs = { roomId: string; password?: string };

/**
 * Hook để join một match room với status Unassigned
 * Phòng private: truyền password trong args.
 *
 * @example
 * joinRoom({ roomId: '123' });
 * joinRoom({ roomId: '123', password: 'secret' });
 */
export const useJoinRoomAsUnassigned = () => {
  const queryClient = useQueryClient();

  return useMutation<JoinRoomResponse, Error, JoinRoomAsUnassignedArgs>({
    mutationFn: (args: JoinRoomAsUnassignedArgs) =>
      roomsApi.joinMatchRoom({
        roomId: args.roomId,
        ...(args.password && { password: args.password }),
      }),

    onSuccess: (_data, args) => {
      const roomId = args.roomId;
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(roomId) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
    },
  });
};
