import { usePagination } from "@/shared/hooks/usePagination";
import { getPosts } from "../api/postApi";
import { Post } from "../types/post.types";

interface UsePaginatedPostsOptions {
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

  // Note: usePagination hook already handles initial fetch in its useEffect
  // No need to call refresh() again here

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
