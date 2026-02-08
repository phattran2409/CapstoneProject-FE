import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../api/profileKeys';
import { sendFriendRequest, removeFriend } from '../api/profileApi';

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: (_data, userId) => {
      // Invalidate user profile to update follower count
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFriend,
    onSuccess: (_data, userId) => {
      // Invalidate user profile to update follower count
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
    },
  });
};

