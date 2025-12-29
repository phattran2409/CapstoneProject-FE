import { useQuery } from '@tanstack/react-query';
import { chatKeys } from '../api/chatKeys';
import { getChatRooms, getChatRoom } from '../api/chatApi';

export const useChatRooms = () => {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: getChatRooms,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useChatRoom = (chatRoomId: string) => {
  return useQuery({
    queryKey: chatKeys.room(chatRoomId),
    queryFn: () => getChatRoom(chatRoomId),
    enabled: !!chatRoomId,
  });
};

