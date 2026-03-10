

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  players: () => [...leaderboardKeys.all, 'players'] as const,
  playerList: () =>
    [...leaderboardKeys.players(), 'list'] as const,
};

