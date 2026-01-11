export type NotificationType = 'match' | 'friend' | 'post' | 'system';

export interface BaseNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

export interface MatchNotification extends BaseNotification {
  type: 'match';
  matchId?: string;
  matchTitle?: string;
  action?: 'invited' | 'joined' | 'removed' | 'started' | 'finished';
}

export interface FriendNotification extends BaseNotification {
  type: 'friend';
  userId?: string;
  userName?: string;
  action?: 'request' | 'accepted' | 'followed';
}

export interface PostNotification extends BaseNotification {
  type: 'post';
  postId?: string;
  postTitle?: string;
  action?: 'liked' | 'commented' | 'shared';
}

export interface SystemNotification extends BaseNotification {
  type: 'system';
  action?: 'update' | 'maintenance' | 'announcement';
  link?: string;
}

export type Notification = MatchNotification | FriendNotification | PostNotification | SystemNotification;

