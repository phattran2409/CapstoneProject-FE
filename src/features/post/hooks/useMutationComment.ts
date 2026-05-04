import { ApiResponse } from "@/shared/api";
import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  postKeys,
  toggleCommentLike,
  updateComment,
} from "../api";
import { Comment, Reply } from "../types/post.types";

// usePagination stores { data: T[], totalPages, totalCount } — NOT { comments: T[] }
type CommentPage = { data: Comment[]; totalPages: number; totalCount: number };
type ReplyPage = { data: Reply[]; totalPages: number; totalCount: number };

interface ToggleCommentLikeContext {
  previousCommentPages?: [QueryKey, CommentPage | undefined][];
  previousReplyPages?: [QueryKey, ReplyPage | undefined][];
  commentId: string;
  postId: string;
  parentCommentId?: string;
}

function flipLikeInCommentPage(
  old: CommentPage | undefined,
  commentId: string,
): CommentPage | undefined {
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
}

function flipLikeInReplyPage(
  old: ReplyPage | undefined,
  replyId: string,
): ReplyPage | undefined {
  if (!old || !Array.isArray(old.data)) return old;
  return {
    ...old,
    data: old.data.map((r) =>
      r.commentId === replyId
        ? {
            ...r,
            isLikedByCurrentUser: !r.isLikedByCurrentUser,
            totalLikes: r.isLikedByCurrentUser
              ? r.totalLikes - 1
              : r.totalLikes + 1,
          }
        : r,
    ),
  };
}

/**
 * Toggle like on a comment or reply (optimistic update).
 * - Top-level comment: { commentId, postId }
 * - Reply under a thread: { commentId: replyId, postId, parentCommentId }
 */
export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    { commentId: string; postId: string; parentCommentId?: string },
    ToggleCommentLikeContext
  >({
    mutationFn: ({ commentId }) => toggleCommentLike(commentId),

    onMutate: async ({ commentId, postId, parentCommentId }) => {
      if (parentCommentId) {
        await queryClient.cancelQueries({
          queryKey: postKeys.replies(parentCommentId),
        });
        const previousReplyPages = queryClient.getQueriesData<ReplyPage>({
          queryKey: postKeys.replies(parentCommentId),
        });
        queryClient.setQueriesData<ReplyPage>(
          { queryKey: postKeys.replies(parentCommentId) },
          (old) => flipLikeInReplyPage(old, commentId),
        );
        return {
          previousReplyPages,
          commentId,
          postId,
          parentCommentId,
        };
      }

      await queryClient.cancelQueries({ queryKey: postKeys.comments(postId) });
      const previousCommentPages = queryClient.getQueriesData<CommentPage>({
        queryKey: postKeys.comments(postId),
      });
      queryClient.setQueriesData<CommentPage>(
        { queryKey: postKeys.comments(postId) },
        (old) => flipLikeInCommentPage(old, commentId),
      );

      return { previousCommentPages, commentId, postId };
    },

    onError: (error, variables, context) => {
      console.error("Error liking comment:", error);
      if (context?.previousCommentPages) {
        context.previousCommentPages.forEach(
          ([queryKey, data]: [QueryKey, CommentPage | undefined]) => {
            queryClient.setQueryData(queryKey, data);
          },
        );
      }
      if (context?.previousReplyPages) {
        context.previousReplyPages.forEach(
          ([queryKey, data]: [QueryKey, ReplyPage | undefined]) => {
            queryClient.setQueryData(queryKey, data);
          },
        );
      }
    },

    onSettled: (_, __, { postId, parentCommentId }) => {
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.replies(parentCommentId),
        });
      } else {
        queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      }
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
    onSuccess: (_, { postId, parentCommentId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      if (parentCommentId) {
        queryClient.invalidateQueries({
          queryKey: postKeys.replies(parentCommentId),
        });
      }
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
    { commentId: string; content: string; postId: string }
  >({
    mutationFn: ({ commentId, content }) => updateComment(commentId, content),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (error) => {
      console.error("Error updating comment:", error);
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    { commentId: string; postId: string }
  >({
    mutationFn: ({ commentId }) => deleteComment(commentId),
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
    onError: (error) => {
      console.error("Error deleting comment:", error);
    },
  });
};
