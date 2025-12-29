import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../api/profileKeys';
import { followUser, unfollowUser } from '../api/profileApi';

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: (_data, userId) => {
      // Invalidate user profile to update follower count
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_data, userId) => {
      // Invalidate user profile to update follower count
      queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.me() });
    },
  });
};

