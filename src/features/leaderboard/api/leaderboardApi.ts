import { apiClient } from '@/shared/api/client';
import {
  Players,
  PlayersResponse,
} from '../types/leaderboard.types';

export interface GetLeaderboardParams {
  page?: number;
  pageSize?: number;
  role?: string;
  sortBy?: string;
  isActive?: boolean;
  sortOrder?: 'asc' | 'desc';
}

// Get player leaderboard
export const getLeaderboardPlayers = async ({
  page = 1,
  pageSize = 10,
  role = 'Player',
  sortBy = 'currentElo',
  sortOrder = 'desc',
  isActive = true,
}: GetLeaderboardParams = {}): Promise<{
  users: Players[];
  totalPages: number;
  totalCount: number;
}> => {
  try {
    const url = `/users?page=${page}&pageSize=${pageSize}&role=${role}&sortBy=${sortBy}&sortOrder=${sortOrder}&isActive=${isActive}`;

    const response = (await apiClient.get(url)) as PlayersResponse;
    if (response.isSuccess && response.data) {
      return {
        users: response.data.users,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch users");
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

