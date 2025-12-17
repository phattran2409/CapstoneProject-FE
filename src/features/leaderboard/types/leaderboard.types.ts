export interface LeaderboardPlayer {
  id: string;
  rank: number;
  previousRank?: number;
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  elo: number;
  eloChange: number;
  trend: 'up' | 'down' | 'stable';
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  recentForm: ('W' | 'L' | 'D')[]; // Last 5 matches
}

export interface LeaderboardFilters {
  timeframe?: 'weekly' | 'monthly' | 'allTime';
  format?: '5vs5' | '7vs7' | '11vs11';
  region?: string;
  limit?: number;
}

export interface TeamLeaderboard {
  id: string;
  rank: number;
  teamName: string;
  avatar?: string;
  elo: number;
  matchesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface LeaderboardStats {
  totalPlayers: number;
  averageElo: number;
  highestElo: number;
  lowestElo: number;
  totalMatches: number;
  updatedAt: string;
}

