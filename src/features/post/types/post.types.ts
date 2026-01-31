import { ImageSourcePropType } from "react-native";

// MediaItem type for displaying media in detail view
export type MediaItem =
  | { type: "image"; source: ImageSourcePropType }
  | { type: "video"; source: string; thumbnail?: ImageSourcePropType };

export interface PostMedia {
  mediaId: string;
  publicUrl: string;
  mediaType: 0 | 1; // 0: image, 1: video
  displayOrder: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null;
}

export interface Post {
  postId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  content: string;
  totalMedia: number;
  totalLikes: number;
  totalComments: number;
  visibility: number;
  isEdited: boolean;
  editedAt: string | null;
  createdAt: string;
  updatedAt?: string;
  media: PostMedia[];
  isLikedByCurrentUser: boolean;
}

export interface PostsResponse {
  isSuccess: boolean;
  data: {
    posts: Post[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface Media {

}

export interface PostLikeResponse {
  isSuccess: boolean;
  data: {
    postId: string;
    isLiked: boolean;
    totalLikes: number;
  };
}

export interface PostDetailResponse {
  isSuccess: boolean;
  data: Post;
}

export interface PostLikeResponse {
  isSuccess: boolean;
  data: {
    postId: string;
    isLiked: boolean;
    totalLikes: number;
  };
}


export interface Comment {
  commentId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  content: string;
  totalLikes: number;
  totalReplies: number;
  isEdited: boolean;
  createdAt: string;
  isLikedByCurrentUser?: boolean;
}

export interface CommentResponse {
  isSuccess: boolean;
  data: {
    comments: Comment[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface Reply {
  commentId: string;
  userId: string;
  userFullName: string;
  userAvatarUrl: string | null;
  content: string;
  totalLikes: number;
  isEdited: boolean;
  createdAt: string;
  isLikedByCurrentUser?: boolean;
}

export interface ReplyResponse {
  isSuccess: boolean;
  data: {
    parentCommentId: string;
    replies: Reply[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface CreateComment {
  commentId: string;
  postId: string;
  parentCommentId: string | null;
  content: string;
  createdAt: string;
}

export interface CreateCommentResponse {
  isSuccess: boolean;
  data: {
    comments: CreateComment[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}


