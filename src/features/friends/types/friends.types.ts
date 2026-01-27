export interface FriendRequests {
  friendshipId: string;
  requesterId: string;
  requesterFullName: string;
  requesterAvatarUrl: string;
  currentElo: number;
  preferredPositions: string;
  sentAt: string;
}

export interface FriendRequestResponse {
  isSuccess: boolean;
  data: {
    requests: FriendRequests[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export interface Friend {
  userId: string;
  fullName: string;
  avatarUrl: string;
  friendsSince: string;
  currentElo: number;
  preferredPositions: string;
}

export interface FriendResponse {
  isSuccess: boolean;
  data: {
    friends: Friend[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export interface RespondRequest {
  isSuccess: boolean;
  data: {
    friendshipId: string;
    requesterId: string;
    status: string;
    respondedAt: string;
  };
}

export interface RespondRequestData {
  friendshipId: string;
  requesterId: string;
  status: string;
  respondedAt: string;
}

export interface FriendshipStatusResponse {
  isSuccess: boolean;
  data: {
    otherUserId: string;
    status: FriendshipStatus;
    friendshipId: string | null;
  };
}

export interface RemoveFriendResponse {
  isSuccess: boolean;
  data: {
    friendId: string;
    removedAt: string;
  };
}

export interface RemoveFriendData {
  friendId: string;
  removedAt: string;
}

export type FriendshipStatus =
  | "None"
  | "PendingSentByMe"
  | "PendingReceivedFromThem"
  | "Friends";

export interface FriendshipStatusData {
  otherUserId: string;
  status: FriendshipStatus;
  friendshipId: string | null;
}
