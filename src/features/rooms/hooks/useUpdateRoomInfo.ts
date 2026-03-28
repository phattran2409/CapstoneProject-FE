import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

export interface UpdateRoomInfoArgs {
  roomId: string;
  roomName: string;
  description?: string;
  rules?: string;
}

/**
 * Hook cập nhật thông tin phòng (tên, mô tả, luật chơi)
 * PATCH /match-rooms/:id/info
 */
export const useUpdateRoomInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: UpdateRoomInfoArgs) =>
      roomsApi.updateRoomInfo(args.roomId, {
        roomName: args.roomName,
        description: args.description,
        rules: args.rules,
      }),
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(args.roomId) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
    },
  });
};
