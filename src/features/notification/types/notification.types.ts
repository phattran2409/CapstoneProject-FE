export type NotificationType = 'MatchRoom' | 'Friendship' | 'Post' | 'Announcement' | 'Chat';
export interface BaseNotification {
  notificationId: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  deepLink: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}


