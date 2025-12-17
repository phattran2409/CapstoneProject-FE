import { apiClient } from '@/shared/api/client';
import {
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  MatchHistory,
} from '../types/profile.types';

// Get my profile
export const getMyProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>('/users/me');
  return response.data;
};

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  const response = await apiClient.get<UserProfile>(`/users/${userId}`);
  return response.data;
};

// Update my profile
export const updateMyProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/users/me', data);
  return response.data;
};

// Update avatar
export const updateAvatar = async (avatarUri: string): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('avatar', {
    uri: avatarUri,
    type: 'image/jpeg',
    name: 'avatar.jpg',
  } as any);

  const response = await apiClient.patch<UserProfile>('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get match history
export const getMatchHistory = async (userId?: string): Promise<MatchHistory[]> => {
  const endpoint = userId ? `/users/${userId}/matches` : '/users/me/matches';
  const response = await apiClient.get<MatchHistory[]>(endpoint);
  return response.data;
};

// Update preferences
export const updatePreferences = async (
  data: UpdatePreferencesData
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>('/users/me/preferences', data);
  return response.data;
};

// Follow user
export const followUser = async (userId: string): Promise<void> => {
  await apiClient.post(`/users/${userId}/follow`);
};

// Unfollow user
export const unfollowUser = async (userId: string): Promise<void> => {
  await apiClient.delete(`/users/${userId}/follow`);
};

// Get followers
export const getFollowers = async (userId: string): Promise<UserProfile[]> => {
  const response = await apiClient.get<UserProfile[]>(`/users/${userId}/followers`);
  return response.data;
};

// Get following
export const getFollowing = async (userId: string): Promise<UserProfile[]> => {
  const response = await apiClient.get<UserProfile[]>(`/users/${userId}/following`);
  return response.data;
};

