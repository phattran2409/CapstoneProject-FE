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
  isSuccess: boolean;
  data: {
    leaderboard: Leaderboard[];
  };
}

export interface LeaderboardData {
  leaderboard: Leaderboard[];
}

/** Payload sau khi unwrap từ API (GET my-rank) */
export interface MyRankData {
  rank: number;
}