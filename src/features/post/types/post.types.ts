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

export interface PostDetailResponse {
  isSuccess: boolean;
  data: Post;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: any;
    username: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replies?: Reply[];
}

export interface Reply {
  id: string;
  commentId: string;
  author: {
    id: string;
    name: string;
    avatar: any;
    username: string;
  };
  content: string;
  likes: number;
  isLiked: boolean;
  timestamp: string;
  replyTo?: {
    id: string;
    name: string;
    username: string;
  };
}
