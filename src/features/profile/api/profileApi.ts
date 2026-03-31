import { apiClient } from "@/shared/api/client";
import {
  User,
  UpdateProfileData,
  UserProfileResponse,
  AchievementsData,
} from "../types/profile.types";
import { ApiResponse } from "@/shared/api";

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const response = await apiClient.get<User>(`/users/${userId}`);
    console.log("response :", response.data);

    // Ensure we have valid data before returning
    if (!response.data) {
      throw new Error("Invalid response: User profile data is missing");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const getAchievements = async (): Promise<AchievementsData> => {
  try {
    const response = await apiClient.get<AchievementsData>(`/achievements/me`);
    if (!response.data) {
      throw new Error("Invalid response: User achievements data is missing");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }
};

// Update my profile
export const updateMyProfile = async (
  userId: string,
  data: UpdateProfileData,
): Promise<User> => {
  // Clean data: remove empty strings and null/undefined values
  // Backend expects null for optional fields, not empty strings
  const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
    // Skip empty strings, null, and undefined
    if (value !== "" && value !== null && value !== undefined) {
      acc[key as keyof UpdateProfileData] = value;
    }
    return acc;
  }, {} as Partial<UpdateProfileData>);

  console.log("📤 Sending profile update:", cleanedData);

  const response = await apiClient.put<User>(`/users/${userId}`, cleanedData);
  return response.data;
};

// Update avatar
export const updateAvatar = async (
  file: File | { uri: string; type: string; name: string },
): Promise<ApiResponse<{ avatarUrl: string }>> => {
  const formData = new FormData();
  formData.append("file", file as any);
  const response = await apiClient.post(`/users/avatar`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const apiResponse = response as unknown as ApiResponse<{ avatarUrl: string }>;
  if (apiResponse.isSuccess) {
    return apiResponse;
  }
  throw new Error("Avatar update failed");
};

// Send friend request
export const sendFriendRequest = async (addresseeId: string): Promise<void> => {
  try {
    await apiClient.post(`/friendships/request/${addresseeId}`);
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

//Remove Friend
export const removeFriend = async (friendId: string): Promise<void> => {
  try {
    await apiClient.delete(`/friendships/${friendId}`);
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

// Get match history for a user (stub – implement when backend is ready)
export const getMatchHistory = async (userId?: string): Promise<unknown[]> => {
  const id = userId || "me";
  const response = await apiClient.get(`/users/${id}/match-history`);
  return (response as { data?: unknown[] })?.data ?? [];
};

//Update notification settings
export const updateNotificationSettings = async (
  matchRoom: boolean,
  friendship: boolean,
  post: boolean,
  chat: boolean,
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.put(`/notification-preferences`, {
      matchRoom,
      friendship,
      post,
      chat,
    });
    console.log("response :", response);
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

export interface NotificationPreferences {
  matchRoom: boolean;
  friendship: boolean;
  post: boolean;
  chat: boolean;
}

export const getNotificationSettings =
  async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(
      `/notification-preferences`,
    );
    if (!response.data) throw new Error("No notification preferences data");
    console.log("response :", response.data);
    return response.data;
  };
