export interface Players {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: number;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  preferredPositions: string;
  shirtNumber: number;
  preferredFoot: string;
  playerProfile: PlayerProfile | null;
}

export interface PlayerProfile {
  profileId: string;
  currentElo: number;
  trustScore: number;
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  mvpCount: number;
  winStreak: number;
  maxWinStreak: number;
  afkCount: number;
  reportCount: number;
}

export interface PlayersResponse {
  isSuccess: boolean;
  data: {
    users: Players[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}
