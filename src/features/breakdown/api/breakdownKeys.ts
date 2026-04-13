export const breakdownKeys = {
  all: ["breakdown"] as const,
  eloBreakdown: (matchId?: string) =>
    [...breakdownKeys.all, "elo-breakdown", matchId ?? "all"] as const,
};
