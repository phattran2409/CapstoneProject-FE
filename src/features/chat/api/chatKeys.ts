export const chatKeys = {
  all: ["chat"] as const,
  conversations: () => [...chatKeys.all, "conversations"] as const,
  conversation: (otherUserId: string) =>
    [...chatKeys.all, "conversation", otherUserId] as const,
};

