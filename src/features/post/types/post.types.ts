export interface PostAuthor {
  id: string;
  name: string;
  avatar: any;
  username: string;
}

export interface Post {
  id: string;
  author: PostAuthor;
  community?: string;
  timestamp: string;
  title: string;
  content: string;
  image?: any; // Deprecated: use images instead
  images?: any[]; // Support multiple images
  type?: 'post' | 'match' | 'announcement';
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
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

