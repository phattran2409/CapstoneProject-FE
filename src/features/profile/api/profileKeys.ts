export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  detail: (userId: string) => [...profileKeys.all, "detail", userId] as const,
  stats: (userId: string) => [...profileKeys.all, "stats", userId] as const,
  matchHistory: (userId: string) =>
    [...profileKeys.all, "matchHistory", userId] as const,
  notificationPreferences: () =>
    [...profileKeys.all, "notification-preferences"] as const,
  sendFriendRequest: (userId: string) =>
    [...profileKeys.all, "sendFriendRequest", userId] as const,
  removeFriend: (userId: string) =>
    [...profileKeys.all, "removeFriend", userId] as const,
  achievements: () => [...profileKeys.all, "achievements"] as const,
  radarChart: () => [...profileKeys.all, "radar-chart"] as const,
  eloBreakdown: (matchId?: string) =>
    [...profileKeys.all, "elo-breakdown", matchId ?? "all"] as const,
};
