import { usePagination } from "@/shared/hooks/usePagination";
import { Friend, FriendRequests, Players } from "../types/friends.types";
import { friendKeys, getFriendRequests, getFriends, getPlayers } from "../api";

interface UsePaginatedFriendsOptions {
  pageSize?: number;
  enabled?: boolean;
  searchTerm?: string;
}

interface UsePaginatedFriendsRequestOptions {
  pageSize?: number;
  enabled?: boolean;
  searchTerm?: string;
}

export const usePaginatedFriends = ({
  pageSize = 10,
  enabled = true,
  searchTerm,
}: UsePaginatedFriendsOptions = {}) => {
  const pagination = usePagination<Friend>({
    queryKey: [...friendKeys.list(), searchTerm || ""],
    fetchFunction: async (page, size) => {
      const result = await getFriends(page, size, searchTerm);
      return {
        data: result.friends,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching friends:", error);
    },
  });
  return {
    friends: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setFriends: pagination.setData,
  };
};

export const usePaginatedPlayers = ({
  pageSize = 10,
  enabled = true,
  searchTerm,
}: UsePaginatedFriendsOptions = {}) => {
  const pagination = usePagination<Players>({
    queryKey: [...friendKeys.players(), searchTerm || ""],
    fetchFunction: async (page, size) => {
      const result = await getPlayers(page, size, searchTerm);
      return {
        data: result.users,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching friends:", error);
    },
  });
  return {
    users: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setUsers: pagination.setData,
  };
};

export const usePaginatedFriendRequests = ({
  pageSize = 10,
  enabled = true,
  searchTerm,
}: UsePaginatedFriendsRequestOptions = {}) => {
  const pagination = usePagination<FriendRequests>({
    queryKey: [...friendKeys.requests(), searchTerm || ""],
    fetchFunction: async (page, size) => {
      const result = await getFriendRequests(page, size, searchTerm);
      return {
        data: result.requests,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching friend requests:", error);
    },
  });
  return {
    friendRequests: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setFriendRequests: pagination.setData,
  };
};
