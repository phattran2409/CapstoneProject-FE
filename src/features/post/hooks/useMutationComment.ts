import { ApiResponse } from "@/shared/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createComment,
  deleteComment,
  postKeys,
  toggleCommentLike,
  updateComment,
} from "../api";

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, string>({
    mutationFn: (commentId: string) => toggleCommentLike(commentId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error liking comment:", error);
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
