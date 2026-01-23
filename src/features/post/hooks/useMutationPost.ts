import { useMutation, useQueryClient } from "@tanstack/react-query";
import { togglePostLike } from "../api/postApi";
import { PostLikeResponse } from "../types/post.types";

interface UseTogglePostLikeOptions {
  onSuccess?: (data: PostLikeResponse["data"]) => void;
}

export const useTogglePostLike = (options?: UseTogglePostLikeOptions) => {
  const queryClient = useQueryClient();

  return useMutation<PostLikeResponse, Error, string>({
    mutationFn: (postId: string) => togglePostLike(postId),
    onSuccess: (response, postId) => {
      // Invalidate posts queries (for React Query based lists)
      queryClient.invalidateQueries({ queryKey: ["posts"] });

      console.log("Post liked successfully:", {
        postId,
        isLiked: response.data.isLiked,
        totalLikes: response.data.totalLikes,
      });

      // Call custom onSuccess callback to update local state
      options?.onSuccess?.(response.data);
    },
    onError: (error, postId) => {
      console.error("Error liking post:", postId, error);
    },
  });
};
