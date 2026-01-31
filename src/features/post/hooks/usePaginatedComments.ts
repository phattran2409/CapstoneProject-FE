import { usePagination } from "@/shared/hooks";
import { Comment } from "../types/post.types";
import { getComments, postKeys } from "../api";
import { useQueryClient } from "@tanstack/react-query";

interface UsePaginatedCommentsOptions {
  pageSize?: number;
  postId: string;
  enabled?: boolean;
}

interface UsePaginatedRepliesOptions {
  pageSize?: number;
  commentId: string;
  enabled?: boolean;
}

export const usePaginatedComments = ({
  postId,
  pageSize = 10,
  enabled = true,
}: UsePaginatedCommentsOptions) => {
  const pagination = usePagination<Comment>({
    queryKey: postKeys.comments(postId),
    fetchFunction: async (page, size) => {
      const result = await getComments(page, size, postId);
      return {
        data: result.comments,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching posts:", error);
    },
  });

  return {
    comments: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setComments: pagination.setData,
  };
};

import { Reply } from "../types/post.types";
import { getReplies } from "../api";

export const usePaginatedReplies = ({
  pageSize = 10,
  enabled = true,
  commentId,
}: UsePaginatedRepliesOptions) => {
  const pagination = usePagination<Reply>({
    queryKey: postKeys.replies(commentId),
    fetchFunction: async (page, size) => {
      const result = await getReplies(page, size, commentId);
      return {
        data: result.replies,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching replies:", error);
    },
  });

  return {
    parentCommentId: commentId,
    replies: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setReplies: pagination.setData,
  };
};
