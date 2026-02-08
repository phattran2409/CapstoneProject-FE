import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

export interface UpdateRoomPrivacyArgs {
  roomId: string;
  visibility: string;
  password: string;
}

/**
 * Hook cập nhật privacy phòng (Private/Public + password)
 * PATCH /match-rooms/:id/privacy
 */
export const useUpdateRoomPrivacy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: UpdateRoomPrivacyArgs) =>
      roomsApi.updateRoomPrivacy(args.roomId, {
        visibility: args.visibility,
        password: args.password,
      }),
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(args.roomId) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
    },
  });
};
