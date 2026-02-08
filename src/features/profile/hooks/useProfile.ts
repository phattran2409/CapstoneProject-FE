import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "../api/profileKeys";
import {
  getUserProfile,
  updateMyProfile,
  updateAvatar,
} from "../api/profileApi";
import { UpdateProfileData } from "../types/profile.types";
import { useAuthStore } from "@/features/auth/store/authStore";

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
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateProfileData;
    }) => updateMyProfile(userId, data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(profileKeys.me(), updatedProfile);
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};

// Update avatar
export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  const updateUserAvatar = useAuthStore((state) => state.updateUserAvatar);

  return useMutation({
    mutationFn: (file: File | { uri: string; type: string; name: string }) =>
      updateAvatar(file),
    onSuccess: (response) => {
      // Update auth store with new avatar URL
      if (response.data?.avatarUrl) {
        updateUserAvatar(response.data.avatarUrl);
      }
      // Invalidate all profile queries to refetch
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
    },
  });
};
