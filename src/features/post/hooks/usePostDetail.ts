import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postKeys } from '../api/postKeys';
import {
  getPostDetail,
  getPostComments,
  togglePostLike,
  createComment,
  createReply,
  toggleCommentLike,
  toggleReplyLike,
} from '../api/postApi';
import { Post, Comment } from '../types/post.types';

export const usePostDetail = (postId: string) => {
  return useQuery<Post>({
    queryKey: postKeys.detail(postId),
    queryFn: () => getPostDetail(postId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

export const usePostComments = (postId: string) => {
  return useQuery<Comment[]>({
    queryKey: postKeys.comments(postId),
    queryFn: () => getPostComments(postId),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useTogglePostLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: togglePostLike,
    onSuccess: (data) => {
      queryClient.setQueryData(postKeys.detail(data.id), data);
    },
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createComment(postId, content),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(data.postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.detail(data.postId) });
    },
  });
};

export const useCreateReply = (postId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, content, replyToId }: { commentId: string; content: string; replyToId?: string }) =>
      createReply(commentId, content, replyToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
    },
  });
};

export const useToggleCommentLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: toggleCommentLike,
    onSuccess: (data) => {
      queryClient.setQueryData(postKeys.comments(data.postId), (old: Comment[] | undefined) => {
        if (!old) return old;
        return old.map(c => c.id === data.id ? data : c);
      });
    },
  });
};

export const useToggleReplyLike = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ commentId, replyId }: { commentId: string; replyId: string }) =>
      toggleReplyLike(commentId, replyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.commentId) });
    },
  });
};

