import { apiClient } from '@/shared/api/client';
import {
  ChatRoom,
  Message,
  SendMessageData,
  CreateChatRoomData,
} from '../types/chat.types';

// Get all chat rooms for current user
export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const response = await apiClient.get<ChatRoom[]>('/chat-rooms');
  return response.data;
};

// Get single chat room
export const getChatRoom = async (chatRoomId: string): Promise<ChatRoom> => {
  const response = await apiClient.get<ChatRoom>(`/chat-rooms/${chatRoomId}`);
  return response.data;
};

// Get messages for a chat room
export const getChatMessages = async (chatRoomId: string): Promise<Message[]> => {
  const response = await apiClient.get<Message[]>(
    `/messages?chatRoomId=${chatRoomId}&_sort=createdAt&_order=asc`
  );
  return response.data;
};

// Send message
export const sendMessage = async (data: SendMessageData): Promise<Message> => {
  const response = await apiClient.post<Message>('/messages', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isRead: false,
  });
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (chatRoomId: string): Promise<void> => {
  await apiClient.patch(`/chat-rooms/${chatRoomId}/read`);
};

// Create chat room
export const createChatRoom = async (data: CreateChatRoomData): Promise<ChatRoom> => {
  const response = await apiClient.post<ChatRoom>('/chat-rooms', {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    unreadCount: 0,
  });
  return response.data;
};

// Delete message
export const deleteMessage = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/messages/${messageId}`);
};

// Leave chat room
export const leaveChatRoom = async (chatRoomId: string): Promise<void> => {
  await apiClient.post(`/chat-rooms/${chatRoomId}/leave`);
};

