import { usePagination } from "@/shared/hooks/usePagination";
import { getPosts, getPostsByUserId } from "../api/postApi";
import { Post } from "../types/post.types";

interface UsePaginatedPostsOptions {
  pageSize?: number;
  userId?: string;
  searchTerm?: string;
}
interface UsePaginatedUserPostsOptions {
  userId: string;
  pageSize?: number;
}

export const usePaginatedPosts = ({
  pageSize = 10,
}: UsePaginatedPostsOptions = {}) => {
  const pagination = usePagination<Post>({
    fetchFunction: async (page, size) => {
      const result = await getPosts(page, size);
      return {
        data: result.posts,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
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
}: UsePaginatedUserPostsOptions) => {
  const pagination = usePagination<Post>({
    fetchFunction: async (page, size) => {
      const result = await getPostsByUserId(userId, page, size);
      return {
        data: result.posts,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
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


