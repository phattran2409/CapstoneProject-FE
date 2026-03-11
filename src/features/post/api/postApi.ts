import { apiClient } from "@/shared/api/client";
import {
  Post,
  PostsResponse,
  PostDetailResponse,
  PostLikeResponse,
  Comment,
  CommentResponse,
  Reply,
  ReplyResponse,
} from "../types/post.types";
import { ApiResponse } from "@/shared/api";

// Get posts with pagination
export const getPosts = async (
  page: number = 1,
  pageSize: number = 10,
  searchTerm?: string,
): Promise<{ posts: Post[]; totalPages: number; totalCount: number }> => {
  try {
    let url = `/posts?page=${page}&pageSize=${pageSize}`;
    if (searchTerm && searchTerm.trim()) {
      url += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
    }
    const response = (await apiClient.get(url)) as PostsResponse;

    if (response.isSuccess && response.data) {
      return {
        posts: response.data.posts,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }

    throw new Error("Failed to fetch posts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostsByUserId = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<{ posts: Post[]; totalPages: number; totalCount: number }> => {
  try {
    const response = (await apiClient.get(
      `/posts?page=${page}&pageSize=${pageSize}&userId=${userId}`,
    )) as PostsResponse;

    if (response.isSuccess && response.data) {
      return {
        posts: response.data.posts,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }

    throw new Error("Failed to fetch posts");
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Get post detail
export const getPostDetail = async (id: string): Promise<Post> => {
  try {
    const response = (await apiClient.get(
      `/posts/${id}`,
    )) as PostDetailResponse;
    if (response.isSuccess && response.data) {
      return response.data;
    }
    throw new Error("Post not found");
  } catch (error) {
    console.error("Error fetching post detail:", error);
    throw error;
  }
};

// Like/Unlike post
export const togglePostLike = async (
  postId: string,
): Promise<PostLikeResponse> => {
  try {
    const response = (await apiClient.post(
      `/posts/${postId}/like`,
    )) as PostLikeResponse;
    if (response.isSuccess && response.data) {
      return response;
    }
    throw new Error("Post like failed");
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

export const reportContent = async (
  contentId: string,
  contentType: string,
  reason: string,
  description: string,
): Promise<ApiResponse> => {
  try {
    const res = await apiClient.post(`/content-reports/${contentType}/${contentId}`, {
      reason: reason,
      description: description,
    });
    return res as unknown as ApiResponse;
  } catch (error) {
    console.error("Error reporting content:", error);
    throw error;
  }
};

// Create Post
export const createPost = async (
  content: string,
  files: Array<File | { uri: string; type: string; name: string }>,
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append("Content", content);
    files.forEach((file) => {
      formData.append("Files", file as any);
    });
    // apiClient interceptor already returns response.data
    const response = await apiClient.post(`/posts`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const apiResponse = response as unknown as ApiResponse;
    if (apiResponse.isSuccess) {
      return apiResponse;
    }
    throw new Error("Post creation failed");
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Update Post
export const updatePost = async (
  postId: string,
  content: string,
): Promise<ApiResponse> => {
  // apiClient interceptor already returns response.data
  const res = await apiClient.put(`/posts/${postId}`, { Content: content });

  return res as unknown as ApiResponse;
};

// Delete Post
export const deletePost = async (postId: string): Promise<ApiResponse> => {
  // apiClient interceptor already returns response.data
  const res = await apiClient.delete(`/posts/${postId}`);

  return res as unknown as ApiResponse;
};

export const getComments = async (
  page: number = 1,
  pageSize: number = 20,
  postId: string,
): Promise<{ comments: Comment[]; totalPages: number; totalCount: number }> => {
  try {
    const response = (await apiClient.get(
      `/comments/${postId}?page=${page}&pageSize=${pageSize}`,
    )) as CommentResponse;

    if (response.isSuccess && response.data) {
      return {
        comments: response.data.comments,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch comments");
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const getReplies = async (
  page: number = 1,
  pageSize: number = 20,
  commentId: string,
): Promise<{ replies: Reply[]; totalPages: number; totalCount: number }> => {
  try {
    const response = (await apiClient.get(
      `/comments/${commentId}/replies?page=${page}&pageSize=${pageSize}`,
    )) as ReplyResponse;

    if (response.isSuccess && response.data) {
      return {
        replies: response.data.replies,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch comments");
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Create comments for a post
export const createComment = async (
  postId: string,
  content: string,
  parentCommentId?: string,
): Promise<ApiResponse> => {
  // apiClient interceptor already returns response.data
  const res = await apiClient.post(`/comments/${postId}`, {
    parentCommentId: parentCommentId,
    content: content,
  });

  return res as unknown as ApiResponse;
};

// Update comments for a post
export const updateComment = async (
  commentId: string,
  content: string,
): Promise<ApiResponse> => {
  const res = await apiClient.put(`/comments/${commentId}`, {
    content,
  });
  return res as unknown as ApiResponse;
};

// Delete comment for a post
export const deleteComment = async (
  commentId: string,
): Promise<ApiResponse> => {
  const res = await apiClient.delete(`/comments/${commentId}`);
  return res as unknown as ApiResponse;
};

// Like/Unlike comment
export const toggleCommentLike = async (
  commentId: string,
): Promise<ApiResponse> => {
  // apiClient interceptor already returns response.data
  const response = await apiClient.post(`/comments/${commentId}/like`);

  return response as unknown as ApiResponse;
};

// Like/Unlike reply (stub until backend is ready)
export const toggleReplyLike = async (
  commentId: string,
  replyId: string,
): Promise<ApiResponse> => {
  const response = await apiClient.post(
    `/comments/${commentId}/replies/${replyId}/like`,
  );
  return response as unknown as ApiResponse;
};
