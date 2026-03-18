

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  leaderboard: () => [...leaderboardKeys.all, 'leaderboard'] as const,
  list: (page?: number, pageSize?: number) =>
    [...leaderboardKeys.leaderboard(), page, pageSize] as const,
  myRank: () => [...leaderboardKeys.all, 'my-rank'] as const,
};

