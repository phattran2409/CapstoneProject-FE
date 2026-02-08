export interface User {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  avatarUrl?: string;
  bio: string | null;
  dateOfBirth: string | null;
  gender: number | null; // 0 = Male, 1 = Female, 2 = Other
  role: number;
  preferredPositions: string | null;
  shirtNumber: number | null;
  preferredFoot: string | null;
  isEmailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
  preferredPositions: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  dateOfBirth?: string;
  gender?: number; // 0 = Male, 1 = Female, 2 = Other
  preferredPositions?: string;
  shirtNumber?: number;
  preferredFoot?: string;
}

export interface UserProfileResponse {
  isSuccess: boolean;
  data: User;
}
