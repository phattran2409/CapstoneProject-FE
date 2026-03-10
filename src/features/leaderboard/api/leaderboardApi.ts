import { LeaderboardResponse } from './../types/leaderboard.types';
import { apiClient } from '@/shared/api/client';



// Get player leaderboard
export const getLeaderboardPlayers = async (): Promise<LeaderboardResponse> => {
  try {
    const url = `/playerprofiles/leaderboard`;

    const response = (await apiClient.get(url)) as LeaderboardResponse;
    if (response.isSuccess && response.data) {
      return {
        isSuccess: response.isSuccess,
        data: {
          leaderboard: response.data.leaderboard,
        },
      };
    }
    throw new Error("Failed to fetch leaderboard");
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

export const getMyRank = async (): Promise<{ isSuccess: boolean, data: { rank: number } }> => {
  try {
    const url = `/playerprofiles/my-rank`;
    const response = (await apiClient.get(url)) ;
    return response.data as { isSuccess: boolean, data: { rank: number } };
  } catch (error) {
    console.error("Error fetching my rank:", error);
    throw error;
  }
};

