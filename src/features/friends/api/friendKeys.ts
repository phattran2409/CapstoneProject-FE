export const friendKeys = {
  all: ["friends"] as const,

  list: () => [...friendKeys.all, "list"] as const,

  requests: () => [...friendKeys.all, "requests"] as const,

  status: (userId: string) => [...friendKeys.all, "status", userId] as const,

  players: () => [...friendKeys.all, "players"] as const,

  //   requestDetail: (friendshipId: string) =>
  //     [...friendKeys.all, "requests", friendshipId] as const,
};
