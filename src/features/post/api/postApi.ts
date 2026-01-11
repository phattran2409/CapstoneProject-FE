import { apiClient } from '@/shared/api/client';
import { Post, Comment } from '../types/post.types';
import { mockPostDetail, mockComments } from '../data/mockPosts';

// Get post detail
export const getPostDetail = async (id: string): Promise<Post> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.get<Post>(`/posts/${id}`);
  // return response.data;

  // Mock data
  if (id === '1') {
    return mockPostDetail;
  }
  throw new Error('Post not found');
};

// Get comments for a post
export const getPostComments = async (postId: string): Promise<Comment[]> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.get<Comment[]>(`/posts/${postId}/comments`);
  // return response.data;

  // Mock data
  if (postId === '1') {
    return mockComments;
  }
  return [];
};

// Like/Unlike post
export const togglePostLike = async (postId: string): Promise<Post> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.post<Post>(`/posts/${postId}/like`);
  // return response.data;

  // Mock data
  const post = JSON.parse(JSON.stringify(mockPostDetail));
  post.isLiked = !post.isLiked;
  post.likes += post.isLiked ? 1 : -1;
  return post;
};

// Create comment
export const createComment = async (postId: string, content: string): Promise<Comment> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.post<Comment>(`/posts/${postId}/comments`, { content });
  // return response.data;

  // Mock data
  const newComment: Comment = {
    id: `comment${Date.now()}`,
    postId,
    author: {
      id: 'currentUser',
      name: 'Current User',
      avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
      username: 'currentuser',
    },
    content,
    likes: 0,
    isLiked: false,
    timestamp: 'Vừa xong',
    replies: [],
  };
  currentComments = [newComment, ...currentComments];
  return JSON.parse(JSON.stringify(newComment));
};

// Create reply
export const createReply = async (commentId: string, content: string, replyToId?: string): Promise<Comment['replies']>[0] => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.post(`/comments/${commentId}/replies`, { content, replyToId });
  // return response.data;

  // Mock data
  const comment = currentComments.find(c => c.id === commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }

  const replyToComment = replyToId ? currentComments.find(c => c.id === replyToId) : undefined;
  const replyTo = replyToComment?.author;

  const newReply = {
    id: `reply${Date.now()}`,
    commentId,
    author: {
      id: 'currentUser',
      name: 'Current User',
      avatar: require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png'),
      username: 'currentuser',
    },
    content,
    likes: 0,
    isLiked: false,
    timestamp: 'Vừa xong',
    ...(replyTo && {
      replyTo: {
        id: replyTo.id,
        name: replyTo.name,
        username: replyTo.username,
      },
    }),
  };

  if (!comment.replies) {
    comment.replies = [];
  }
  comment.replies.push(newReply);
  return JSON.parse(JSON.stringify(newReply));
};

// Like/Unlike comment
export const toggleCommentLike = async (commentId: string): Promise<Comment> => {
  // TODO: Replace with real API call when backend is ready
  // const response = await apiClient.post(`/comments/${commentId}/like`);
  // return response.data;

  // Mock data
  const comment = currentComments.find(c => c.id === commentId);
  if (!comment) {
    throw new Error('Comment not found');
  }
  comment.isLiked = !comment.isLiked;
  comment.likes += comment.isLiked ? 1 : -1;
  return JSON.parse(JSON.stringify(comment));
};

// Like/Unlike reply
export const toggleReplyLike = async (commentId: string, replyId: string): Promise<void> => {
  // TODO: Replace with real API call when backend is ready
  // await apiClient.post(`/replies/${replyId}/like`);

  // Mock data
  const comment = currentComments.find(c => c.id === commentId);
  if (!comment || !comment.replies) {
    throw new Error('Comment or reply not found');
  }
  const reply = comment.replies.find(r => r.id === replyId);
  if (!reply) {
    throw new Error('Reply not found');
  }
  reply.isLiked = !reply.isLiked;
  reply.likes += reply.isLiked ? 1 : -1;
};

