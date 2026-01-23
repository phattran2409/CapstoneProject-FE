import { usePagination } from "@/shared/hooks/usePagination";
import { getPosts, getPostsByUserId } from "../api/postApi";
import { postKeys } from "../api/postKeys";
import { Post } from "../types/post.types";

interface UsePaginatedPostsOptions {
  pageSize?: number;
  userId?: string;
  searchTerm?: string;
  enabled?: boolean;
}

interface UsePaginatedUserPostsOptions {
  userId: string;
  pageSize?: number;
  enabled?: boolean;
}

export const usePaginatedPosts = ({
  pageSize = 10,
  enabled = true,
}: UsePaginatedPostsOptions = {}) => {
  const pagination = usePagination<Post>({
    queryKey: postKeys.list(),
    fetchFunction: async (page, size) => {
      const result = await getPosts(page, size);
      return {
        data: result.posts,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000, // 2 minutes for posts list
    enabled,
    onError: (error) => {
      console.error("Error fetching posts:", error);
    },
  });

  return {
    posts: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setPosts: pagination.setData,
  };
};

export const usePaginatedUserPosts = ({
  userId,
  pageSize = 10,
  enabled = true,
}: UsePaginatedUserPostsOptions) => {
  const pagination = usePagination<Post>({
    queryKey: postKeys.postsByUserId(userId),
    fetchFunction: async (page, size) => {
      const result = await getPostsByUserId(userId, page, size);
      return {
        data: result.posts,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000, // 2 minutes for user posts
    enabled: enabled && !!userId,
    onError: (error) => {
      console.error("Error fetching user posts:", error);
    },
  });

  return {
    posts: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setPosts: pagination.setData,
  };
};


