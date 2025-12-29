import { LeaderboardFilters } from '../types/leaderboard.types';

export const leaderboardKeys = {
  all: ['leaderboard'] as const,
  players: () => [...leaderboardKeys.all, 'players'] as const,
  playerList: (filters?: LeaderboardFilters) => 
    [...leaderboardKeys.players(), { filters }] as const,
  teams: () => [...leaderboardKeys.all, 'teams'] as const,
  teamList: (filters?: LeaderboardFilters) => 
    [...leaderboardKeys.teams(), { filters }] as const,
  stats: () => [...leaderboardKeys.all, 'stats'] as const,
  myRank: () => [...leaderboardKeys.all, 'myRank'] as const,
};

