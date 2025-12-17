import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../api/profileKeys';
import {
  getMyProfile,
  getUserProfile,
  updateMyProfile,
  updateAvatar,
  updatePreferences,
} from '../api/profileApi';
import { UpdateProfileData, UpdatePreferencesData } from '../types/profile.types';

// Get my profile
export const useMyProfile = () => {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user profile by ID
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
};

// Update my profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateMyProfile(data),
    onSuccess: (updatedProfile) => {
      // Update cached profile
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

// Update avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (avatarUri: string) => updateAvatar(avatarUri),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

// Update preferences
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePreferencesData) => updatePreferences(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
    },
  });
};

