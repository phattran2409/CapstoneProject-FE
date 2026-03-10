import { ApiResponse } from "@/shared/api";
import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  postKeys,
  toggleCommentLike,
  updateComment,
} from "../api";
import { Comment } from "../types/post.types";

// usePagination stores { data: T[], totalPages, totalCount } — NOT { comments: T[] }
type CommentPage = { data: Comment[]; totalPages: number; totalCount: number };

interface ToggleCommentLikeContext {
  previousPages: [QueryKey, CommentPage | undefined][];
  commentId: string;
  postId: string;
}

/**
 * Toggle like on a comment with optimistic update.
 * Variables: { commentId, postId } — postId is needed to target the correct comments cache.
 */
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    { commentId: string; postId: string },
    ToggleCommentLikeContext
  >({
    mutationFn: ({ commentId }) => toggleCommentLike(commentId),

    // ✅ Optimistic update: flip like on the comment immediately
    onMutate: async ({ commentId, postId }) => {
      // 1. Cancel in-flight comment queries for this post
      await queryClient.cancelQueries({ queryKey: postKeys.comments(postId) });

      // 2. Snapshot for rollback
      const previousPages = queryClient.getQueriesData<CommentPage>({
        queryKey: postKeys.comments(postId),
      });

      // 3. Flip the liked state optimistically in the paginated cache
      // usePagination cache shape: { data: Comment[], totalPages, totalCount }
      queryClient.setQueriesData<CommentPage>(
        { queryKey: postKeys.comments(postId) },
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((c) =>
              c.commentId === commentId
                ? {
                    ...c,
                    isLikedByCurrentUser: !c.isLikedByCurrentUser,
                    totalLikes: c.isLikedByCurrentUser
                      ? c.totalLikes - 1
                      : c.totalLikes + 1,
                  }
                : c,
            ),
          };
        },
      );

      return { previousPages, commentId, postId };
    },

    // ✅ On error: rollback comments cache
    onError: (error, { postId }, context) => {
      console.error("Error liking comment:", error);
      if (context?.previousPages) {
        context.previousPages.forEach(
          ([queryKey, data]: [QueryKey, CommentPage | undefined]) => {
            queryClient.setQueryData(queryKey, data);
          },
        );
      }
    },

    // ✅ Always refetch to sync exact server state
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    { postId: string; content: string; parentCommentId?: string }
  >({
    mutationFn: ({ postId, content, parentCommentId }) =>
      createComment(postId, content, parentCommentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    { commentId: string; content: string }
  >({
    mutationFn: ({ commentId, content }) => updateComment(commentId, content),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error updating comment:", error);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, string>({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
    },
  });
};
