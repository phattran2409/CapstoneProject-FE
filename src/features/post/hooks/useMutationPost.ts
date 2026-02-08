import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPost,
  togglePostLike,
  updatePost,
  deletePost,
} from "../api/postApi";
import { PostLikeResponse } from "../types/post.types";
import { postKeys } from "../api";
import { ApiResponse } from "@/shared/api";

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation<PostLikeResponse, Error, string>({
    mutationFn: (postId: string) => togglePostLike(postId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error liking post:", error);
    },
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse,
    Error,
    {
      content: string;
      files: Array<File | { uri: string; type: string; name: string }>;
    }
  >({
    mutationFn: ({ content, files }) => createPost(content, files),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error creating post:", error);
    },
  });
};

export const useUpdatePost = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiResponse, Error, { postId: string; content: string }>({
    mutationFn: ({ postId, content }) => updatePost(postId, content),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error updating post:", error);
    },
  });
};

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse, Error, string>({
    mutationFn: (postId: string) => deletePost(postId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
    },
  });
};
