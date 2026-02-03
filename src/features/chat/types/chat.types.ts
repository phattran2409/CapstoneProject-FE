// Generic wrapper cho các response chat API
export interface ChatApiResponse<T> {
  isSuccess: boolean;
  data: T;
}

// ===== Conversations list (/api/chat/conversations) =====

export interface ConversationSummary {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  isOnline: boolean;
}

export interface ConversationListData {
  conversations: ConversationSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ===== Conversation detail (/api/chat/conversation/{otherUserId}) =====

export type ChatMessageType = "Text" | "Image" | "System";

export interface ConversationMessage {
  messageId: string;
  senderId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  messageText: string;
  messageType: ChatMessageType;
  isRead: boolean;
  isEdited: boolean;
  isMine: boolean;
  sentAt: string;
}

export interface ConversationDetailData {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  messages: ConversationMessage[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface RoomChatMessage {
  messageId: string;
  senderId: string;
  senderFullName: string;
  senderAvatarUrl: string | null;
  senderTeam: number;
  messageText: string;
  sentAt: string;
  isEdited: boolean;
}

export interface RoomChatDetailData {
  roomId: string;
  channel: number;
  messages: RoomChatMessage[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}



// ===== Send message (/api/chat/send) =====

export interface SendChatRequestBody {
  senderId: string;
  receiverId: string;
  messageText: string;
  messageType: ChatMessageType;
}

export interface SendChatRoomRequestBody {
  roomId: string;
  channel: string;
  messageText: string;
}

export interface SendChatMessageData {
  messageId: string;
  senderId: string;
  receiverId: string;
  messageText: string;
  messageType: ChatMessageType;
  sentAt: string;
}

export interface SendChatMessageRoomData {
  messageId: string;
  roomId: string;
  channel: number;
  senderId: string;
  senderFullName: string;
  senderAvatarUrl: string | null;
  messageText: string;
  sentAt: string;
}

// ===== Mark as read (/api/chat/read/{fromUserId}) =====

export interface MarkAsReadData {
  fromUserId: string;
  success: boolean;
}

