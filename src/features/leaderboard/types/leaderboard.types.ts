export interface Leaderboard {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  currentElo: number;
  currentRank: string;
  isLegend: boolean;
  eloChange: number;
  totalMatches: number;
}

export interface LeaderboardResponse {
  leaderboard: Leaderboard[];
}