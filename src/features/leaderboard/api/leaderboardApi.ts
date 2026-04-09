import { LeaderboardResponse } from './../types/leaderboard.types';
import { apiClient } from '@/shared/api/client';

type RawLeaderboardResponse =
  | LeaderboardResponse
  | {
      isSuccess?: boolean;
      data?: LeaderboardResponse;
    };

const parseLeaderboardResponse = (raw: RawLeaderboardResponse): LeaderboardResponse => {
  if (raw && typeof raw === "object" && Array.isArray((raw as LeaderboardResponse).leaderboard)) {
    return raw as LeaderboardResponse;
  }
  if (
    raw &&
    typeof raw === "object" &&
    (raw as { isSuccess?: boolean }).isSuccess &&
    (raw as { data?: LeaderboardResponse }).data &&
    Array.isArray((raw as { data: LeaderboardResponse }).data.leaderboard)
  ) {
    return (raw as { data: LeaderboardResponse }).data;
  }
  throw new Error("Failed to parse leaderboard response");
};

// Get player leaderboard
export const getLeaderboardPlayers = async (): Promise<LeaderboardResponse> => {
  try {
    const url = `/playerprofiles/leaderboard`;
    const response = (await apiClient.get(url)) as RawLeaderboardResponse;
    return parseLeaderboardResponse(response);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const getMyRank = async () => {
  try {
    const url = `/playerprofiles/my-rank`;
    const response = (await apiClient.get(url)) as { rank: number };
    return response;
  } catch (error) {
    console.error("Error fetching my rank:", error);
    throw error;
  }
};

