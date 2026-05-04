import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileKeys } from "../api/profileKeys";
import {
  getUserProfile,
  updateMyProfile,
  updateAvatar,
  getAchievements,
  updateNotificationSettings,
  getNotificationSettings,
  getMyRadarChart,
  getUserRadarChart,
  getMyBookings,
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

export const useAchievements = () => {
  return useQuery({
    queryKey: profileKeys.achievements(),
    queryFn: () => getAchievements(),
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyRadarChart = (enabled = true) => {
  return useQuery({
    queryKey: profileKeys.radarChart(),
    queryFn: getMyRadarChart,
    staleTime: 30 * 1000,
    enabled,
  });
};

export const useUserRadarChart = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: profileKeys.userRadarChart(userId),
    queryFn: () => getUserRadarChart(userId),
    staleTime: 30 * 1000,
    enabled: !!userId && enabled,
  });
};

export { useEloBreakdown, useEloBreakdown as useMyEloBreakdown } from "@/features/breakdown/hooks/useEloBreakdown";

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

// Update notification settings
export const useUpdateNotificationSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      matchRoom,
      friendship,
      post,
      chat,
    }: {
      matchRoom: boolean;
      friendship: boolean;
      post: boolean;
      chat: boolean;
    }) => updateNotificationSettings(matchRoom, friendship, post, chat),
    onSuccess: (response) => {
      queryClient.setQueryData(
        profileKeys.notificationPreferences(),
        response.data,
      );
    },
  });
};

export const useNotificationSettings = () => {
  return useQuery({
    queryKey: profileKeys.notificationPreferences(),
    queryFn: getNotificationSettings,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMyBookings = (date: string, page = 1, pageSize = 10) => {
  return useQuery({
    queryKey: profileKeys.bookings(date, page, pageSize),
    queryFn: () => getMyBookings(date, page, pageSize),
    enabled: !!date,
    staleTime: 30 * 1000,
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
