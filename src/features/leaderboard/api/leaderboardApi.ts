import { LeaderboardData, LeaderboardResponse } from './../types/leaderboard.types';
import { apiClient } from '@/shared/api/client';
import { API_CONFIG } from '@/shared/constants/api';


// Get player leaderboard
export const getLeaderboardPlayers = async (): Promise<LeaderboardData> => {
  try {
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.LEADERBOARD.LIST)) as LeaderboardResponse;
    if (response.isSuccess && response.data) {
      return {
        leaderboard: response.data.leaderboard,
      };
    }
    throw new Error("Failed to fetch leaderboard");
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const getMyRank = async () => {
  try {
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.LEADERBOARD.MY_RANK)) as { rank: number };
    return response;
  } catch (error) {
    console.error("Error fetching my rank:", error);
    throw error;
  }
};
