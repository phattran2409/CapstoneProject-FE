import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatKeys } from '../api/chatKeys';
import {
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  deleteMessage,
} from '../api/chatApi';
import { SendMessageData } from '../types/chat.types';

export const useChatMessages = (chatRoomId: string) => {
  return useQuery({
    queryKey: chatKeys.messages(chatRoomId),
    queryFn: () => getChatMessages(chatRoomId),
    enabled: !!chatRoomId,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time feel
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (newMessage) => {
      // Invalidate messages for this chat room
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(newMessage.chatRoomId),
      });
      
      // Invalidate chat rooms list to update last message
      queryClient.invalidateQueries({
        queryKey: chatKeys.rooms(),
      });
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markMessagesAsRead,
    onSuccess: (_data, chatRoomId) => {
      // Invalidate chat rooms to update unread count
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: chatKeys.room(chatRoomId) });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      // Invalidate all messages queries
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
};

