export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (otherUserId: string) =>
    [...chatKeys.all, "conversation", otherUserId] as const,
  roomChat: (roomId: string) => [...chatKeys.all, "roomChat", roomId] as const,
};

