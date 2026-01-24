import { apiClient } from "@/shared/api/client";
import {
  UserProfile,
  UpdateProfileData,
  UpdatePreferencesData,
  MatchHistory,
  UserProfileResponse,
} from "../types/profile.types";


// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>(`/users/${userId}`);
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

// Update my profile
export const updateMyProfile = async (
  data: UpdateProfileData,
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>("/users/me", data);
  return response.data;
};

// Update avatar
export const updateAvatar = async (avatarUri: string): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append("avatar", {
    uri: avatarUri,
    type: "image/jpeg",
    name: "avatar.jpg",
  } as any);

  const response = await apiClient.patch<UserProfile>(
    "/users/me/avatar",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return response.data;
};

// Get match history
export const getMatchHistory = async (
  userId?: string,
): Promise<MatchHistory[]> => {
  const endpoint = userId ? `/users/${userId}/matches` : "/users/me/matches";
  const response = await apiClient.get<MatchHistory[]>(endpoint);
  return response.data;
};

// Update preferences
export const updatePreferences = async (
  data: UpdatePreferencesData,
): Promise<UserProfile> => {
  const response = await apiClient.patch<UserProfile>(
    "/users/me/preferences",
    data,
  );
  return response.data;
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

