export interface Friend {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    elo: number;
    position?: string;
    isOnline: boolean;
    mutualFriends?: number;
    lastActive?: string;
  }

export interface FriendRequest {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    elo: number;
    position?: string;
    mutualFriends?: number;
    sentAt: string;
  }
