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
import { API_CONFIG } from "@/shared/constants/api";

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
    const params: Record<string, any> = { page, pageSize };
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.FRIENDSHIPS.REQUESTS, { params })) as FriendRequestResponse;
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
    const params: Record<string, any> = { page, pageSize };
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.FRIENDSHIPS.FRIENDS, { params })) as FriendResponse;
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
    const params: Record<string, any> = { page, pageSize, role };
    if (searchTerm && searchTerm.trim()) {
      params.searchTerm = searchTerm.trim();
    }

    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.USERS.LIST, { params })) as PlayersResponse;
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
    const url = API_CONFIG.ENDPOINTS.FRIENDSHIPS.STATUS.replace(':userId', userId);
    const response = (await apiClient.get(url)) as FriendshipStatusResponse;

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
    const url = API_CONFIG.ENDPOINTS.FRIENDSHIPS.RESPOND.replace(':requesterId', requesterId);
    const response = (await apiClient.post(url, { accept })) as RespondRequest;

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
    const url = API_CONFIG.ENDPOINTS.FRIENDSHIPS.DETAIL.replace(':userId', userId);
    const response = (await apiClient.delete(url)) as RemoveFriendResponse;

    if (response.isSuccess && response.data) {
      return response.data;
    }
    throw new Error("Failed to remove friend");
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};
