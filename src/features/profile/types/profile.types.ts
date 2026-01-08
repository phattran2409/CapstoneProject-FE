export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  position?: string; // Football position
  preferredFoot?: 'left' | 'right' | 'both';
  shirtNumber?: number;
  // Stats
  stats: PlayerStats;
  
  // Preferences
  preferences: UserPreferences;
  
  // Social
  followers: number;
  following: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface PlayerStats {
  totalMatches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  elo: number;
  rank?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface UserPreferences {
  language: 'en' | 'vi';
  theme: 'light' | 'dark';
  notifications: {
    push: boolean;
    email: boolean;
    matchReminders: boolean;
    messages: boolean;
    roomInvites: boolean;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
    showStats: boolean;
  };
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  position?: string;
  preferredFoot?: 'left' | 'right' | 'both';
  shirtNumber?: number;
}

export interface UpdatePreferencesData {
  language?: 'en' | 'vi';
  theme?: 'light' | 'dark';
  notifications?: Partial<UserPreferences['notifications']>;
  privacy?: Partial<UserPreferences['privacy']>;
}

export interface MatchHistory {
  id: string;
  roomId: string;
  date: string;
  format: '5vs5' | '7vs7' | '11vs11';
  result: 'win' | 'loss' | 'draw';
  teamName: string;
  opponentTeamName: string;
  score: string; // e.g., "3-2"
  goals: number;
  assists: number;
  venue: {
    name: string;
    address: string;
  };
}

