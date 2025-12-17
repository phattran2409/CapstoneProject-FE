export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (chatRoomId: string) => [...chatKeys.all, 'room', chatRoomId] as const,
  messages: (chatRoomId: string) => [...chatKeys.all, 'messages', chatRoomId] as const,
};

