import { useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import {
  createPost,
  togglePostLike,
  updatePost,
  deletePost,
} from "../api/postApi";
import { Post, PostLikeResponse } from "../types/post.types";
import { postKeys } from "../api";
import { ApiResponse } from "@/shared/api";

// usePagination stores { data: T[], totalPages, totalCount } — NOT { posts: T[] }
type PaginationPage = { data: Post[]; totalPages: number; totalCount: number };

interface TogglePostLikeContext {
  previousDetail: Post | undefined;
  previousPages: [QueryKey, PaginationPage | undefined][];
  postId: string;
}

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();

  return useMutation<PostLikeResponse, Error, string, TogglePostLikeContext>({
    mutationFn: (postId: string) => togglePostLike(postId),

    // ✅ Optimistic update: only touch the detail cache (safe) + pagination cache via data field
    onMutate: async (postId: string) => {
      // 1. Cancel in-flight queries for this post's detail
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // 2. Snapshot for rollback
      const previousDetail = queryClient.getQueryData<Post>(
        postKeys.detail(postId),
      );

      // usePagination stores {data: Post[], totalPages, totalCount} — NOT {posts:[]}
      // Snapshot all paginated list caches for rollback
      const previousPages = queryClient.getQueriesData<PaginationPage>({
        queryKey: postKeys.list(),
      });

      // 3. Optimistically flip in the detail cache
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old) => {
        if (!old) return old;
        return {
          ...old,
          isLikedByCurrentUser: !old.isLikedByCurrentUser,
          totalLikes: old.isLikedByCurrentUser
            ? old.totalLikes - 1
            : old.totalLikes + 1,
        };
      });

      // 4. Optimistically flip in all paginated list caches
      // usePagination cache shape: { data: Post[], totalPages: number, totalCount: number }
      queryClient.setQueriesData<PaginationPage>(
        { queryKey: postKeys.list() },
        (old) => {
          if (!old || !Array.isArray(old.data)) return old;
          return {
            ...old,
            data: old.data.map((p) =>
              p.postId === postId
                ? {
                    ...p,
                    isLikedByCurrentUser: !p.isLikedByCurrentUser,
                    totalLikes: p.isLikedByCurrentUser
                      ? p.totalLikes - 1
                      : p.totalLikes + 1,
                  }
                : p,
            ),
          };
        },
      );

      return { previousDetail, previousPages, postId };
    },

    // ✅ Sync exact server values after successful call
    onSuccess: (response, postId) => {
      if (response.isSuccess && response.data) {
        const { isLiked, totalLikes } = response.data;

        // Sync detail cache with server truth
        queryClient.setQueryData<Post>(postKeys.detail(postId), (old) => {
          if (!old) return old;
          return { ...old, isLikedByCurrentUser: isLiked, totalLikes };
        });

        // Sync paginated list caches with server truth
        queryClient.setQueriesData<PaginationPage>(
          { queryKey: postKeys.list() },
          (old) => {
            if (!old || !Array.isArray(old.data)) return old;
            return {
              ...old,
              data: old.data.map((p) =>
                p.postId === postId
                  ? { ...p, isLikedByCurrentUser: isLiked, totalLikes }
                  : p,
              ),
            };
          },
        );
      }
    },

    // ✅ Rollback on error
    onError: (error, postId, context) => {
      console.error("Error liking post:", error);
      if (context?.previousDetail) {
        queryClient.setQueryData(
          postKeys.detail(postId),
          context.previousDetail,
        );
      }
      if (context?.previousPages) {
        context.previousPages.forEach(
          ([key, data]: [QueryKey, PaginationPage | undefined]) => {
            queryClient.setQueryData(key, data);
          },
        );
      }
    },

    // ✅ Always refetch detail after settle for consistency
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
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
