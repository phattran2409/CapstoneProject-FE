import { useMutation } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';

export const useInviteFriend = () => {
  return useMutation({
    mutationFn: (vars: { roomId: string; friendUserId: string }) =>
      roomsApi.inviteFriend(vars.roomId, vars.friendUserId),
  });
};

