export interface Leaderboard {
  rank: number;
  userId: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  currentElo: number;
  eloChange: number;
  totalMatches: number;
}

export interface LeaderboardResponse {
  isSuccess: boolean;
  data: {
      leaderboard: Leaderboard[];
  };
}