import { usePagination } from "@/shared/hooks/usePagination";
import { Friend, FriendRequests } from "../types/friends.types";
import { friendKeys, getFriendRequests, getFriends } from "../api";

interface UsePaginatedFriendsOptions {
  pageSize?: number;
  enabled?: boolean;
}

interface UsePaginatedFriendsRequestOptions {
  pageSize?: number;
  enabled?: boolean;
}

export const usePaginatedFriends = ({
  pageSize = 10,
  enabled = true,
}: UsePaginatedFriendsOptions = {}) => {
  const pagination = usePagination<Friend>({
    queryKey: friendKeys.list(),
    fetchFunction: async (page, size) => {
      const result = await getFriends(page, size);
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

export const usePaginatedFriendRequests = ({
  pageSize = 10,
  enabled = true,
}: UsePaginatedFriendsRequestOptions = {}) => {
  const pagination = usePagination<FriendRequests>({
    queryKey: friendKeys.requests(),
    fetchFunction: async (page, size) => {
      const result = await getFriendRequests(page, size);
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
