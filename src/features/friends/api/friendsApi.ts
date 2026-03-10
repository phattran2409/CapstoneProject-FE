import {
  Friend,
  FriendRequestResponse,
  FriendRequests,
  FriendResponse,
  FriendshipStatusResponse,
  FriendshipStatusData,
  RemoveFriendResponse,
  RemoveFriendData,
  RespondRequest,
  RespondRequestData,
  Players,
  PlayersResponse,
} from "../types/friends.types";
import { apiClient } from "@/shared/api/client";

export const getFriendRequests = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
): Promise<{
  requests: FriendRequests[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    let url = `/friendships/requests?page=${page}&pageSize=${pageSize}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = (await apiClient.get(url)) as FriendRequestResponse;
    if (response.isSuccess && response.data) {
      return {
        requests: response.data.requests,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch friend requests");
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    throw error;
  }
};

export const getFriends = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
): Promise<{
  friends: Friend[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    // Build URL with proper query parameters
    let url = `/friendships/friends?page=${page}&pageSize=${pageSize}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }

    const response = (await apiClient.get(url)) as FriendResponse;
    if (response.isSuccess && response.data) {
      return {
        friends: response.data.friends,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch friends");
  } catch (error) {
    console.error("Error fetching friends:", error);
    throw error;
  }
};

export const getPlayers = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
  role = 'Player'
): Promise<{
  users: Players[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    let url = `/users?page=${page}&pageSize=${pageSize}&role=${role}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }

    const response = (await apiClient.get(url)) as PlayersResponse;
    if (response.isSuccess && response.data) {
      const filteredUsers = response.data.users.filter(
        (u) => u.isEmailVerified && u.isActive,
      );
      return {
        users: filteredUsers,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch users");
  } catch (error) {
    console.error("Error fetching people:", error);
    throw error;
  }
};

export const getFriendshipStatus = async (
  userId: string,
): Promise<FriendshipStatusData> => {
  try {
    const response = (await apiClient.get(
      `/friendships/status/${userId}`,
    )) as FriendshipStatusResponse;

    if (response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error("Failed to get friendship status");
  } catch (error) {
    console.error("Error getting friendship status:", error);
    throw error;
  }
};

export const respondToFriendRequest = async (
  requesterId: string,
  accept: boolean,
): Promise<RespondRequestData> => {
  try {
    const response = (await apiClient.post(
      `/friendships/respond/${requesterId}`,
      { accept },
    )) as RespondRequest;

    if (response.isSuccess && response.data) {
      return response.data;
    }
    throw new Error("Failed to respond to friend request");
  } catch (error) {
    console.error("Error responding to friend request:", error);
    throw error;
  }
};

export const removeFriend = async (
  userId: string,
): Promise<RemoveFriendData> => {
  try {
    const response = (await apiClient.delete(
      `/friendships/${userId}`,
    )) as RemoveFriendResponse;

    if (response.isSuccess && response.data) {
      return response.data;
    }
    throw new Error("Failed to remove friend");
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};
