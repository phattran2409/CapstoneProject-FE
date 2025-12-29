export interface ChatRoom {
  id: string;
  type: 'direct' | 'group' | 'room';
  name?: string; // For group chats
  avatar?: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  role?: 'admin' | 'member';
  joinedAt: string;
}

export interface Message {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: 'text' | 'image' | 'system';
  content: string;
  imageUrl?: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageData {
  chatRoomId: string;
  type: 'text' | 'image' | 'system';
  content: string;
  imageUrl?: string;
  replyToId?: string;
}

export interface CreateChatRoomData {
  type: 'direct' | 'group' | 'room';
  name?: string;
  participantIds: string[];
  roomId?: string; // If type is 'room'
}

