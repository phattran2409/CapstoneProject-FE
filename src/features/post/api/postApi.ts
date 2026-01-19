import { apiClient } from "@/shared/api/client";
import {
  Post,
  Comment,
  PostsResponse,
  PostDetailResponse,
  PostLikeResponse,
} from "../types/post.types";

// Get posts with pagination
export const getPosts = async (
  page: number = 1,
  pageSize: number = 10,
): Promise<{ posts: Post[]; totalPages: number; totalCount: number }> => {
  try {
    const response = (await apiClient.get(
      `/posts?page=${page}&pageSize=${pageSize}`,
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
export const togglePostLike = async (postId: string): Promise<PostLikeResponse> => {
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

// // Get comments for a post
// export const getPostComments = async (postId: string): Promise<Comment[]> => {
//   // TODO: Replace with real API call when backend is ready
//   // const response = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
//   // return response.data;

// };



// Create comment
// export const createComment = async (
//   postId: string,
//   content: string,
// ): Promise<Comment> => {
//   // TODO: Replace with real API call when backend is ready
//   // const response = await apiClient.post<Comment>(`/posts/${postId}/comments`, { content });
//   // return response.data;

// };

// Create reply
// export const createReply = async (
//   commentId: string,
//   content: string,
//   replyToId?: string,
// ): Promise<Comment["replies"]>[0] => {
//   // TODO: Replace with real API call when backend is ready
//   // const response = await apiClient.post(`/comments/${commentId}/replies`, { content, replyToId });
//   // return response.data;

//   // Mock data
//   const comment = currentComments.find((c) => c.id === commentId);
//   if (!comment) {
//     throw new Error("Comment not found");
//   }

//   const replyToComment = replyToId
//     ? currentComments.find((c) => c.id === replyToId)
//     : undefined;
//   const replyTo = replyToComment?.author;

//   const newReply = {
//     id: `reply${Date.now()}`,
//     commentId,
//     author: {
//       id: "currentUser",
//       name: "Current User",
//       avatar: require("@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png"),
//       username: "currentuser",
//     },
//     content,
//     likes: 0,
//     isLiked: false,
//     timestamp: "Vừa xong",
//     ...(replyTo && {
//       replyTo: {
//         id: replyTo.id,
//         name: replyTo.name,
//         username: replyTo.username,
//       },
//     }),
//   };

//   if (!comment.replies) {
//     comment.replies = [];
//   }
//   comment.replies.push(newReply);
//   return JSON.parse(JSON.stringify(newReply));
// };

// Like/Unlike comment
// export const toggleCommentLike = async (
//   commentId: string,
// ): Promise<Comment> => {
//   // TODO: Replace with real API call when backend is ready
//   // const response = await apiClient.post(`/comments/${commentId}/like`);
//   // return response.data;

//   // Mock data
//   const comment = currentComments.find((c) => c.id === commentId);
//   if (!comment) {
//     throw new Error("Comment not found");
//   }
//   comment.isLiked = !comment.isLiked;
//   comment.likes += comment.isLiked ? 1 : -1;
//   return JSON.parse(JSON.stringify(comment));
// };

// Like/Unlike reply
export const toggleReplyLike = async (
  commentId: string,
  replyId: string,
): Promise<void> => {
  // TODO: Replace with real API call when backend is ready
  // await apiClient.post(`/replies/${replyId}/like`);
};

// // Keep track of current comments for mock data
// let currentComments = [...mockComments];
