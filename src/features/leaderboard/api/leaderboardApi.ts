import { apiClient } from '@/shared/api/client';
import {
  LeaderboardPlayer,
  TeamLeaderboard,
  LeaderboardFilters,
  LeaderboardStats,
} from '../types/leaderboard.types';

// Get player leaderboard
export const getPlayerLeaderboard = async (
  filters?: LeaderboardFilters
): Promise<LeaderboardPlayer[]> => {
  const params = new URLSearchParams();
  
  if (filters?.timeframe) params.append('timeframe', filters.timeframe);
  if (filters?.format) params.append('format', filters.format);
  if (filters?.region) params.append('region', filters.region);
  if (filters?.limit) params.append('_limit', filters.limit.toString());
  
  params.append('_sort', 'elo');
  params.append('_order', 'desc');

  const response = await apiClient.get<LeaderboardPlayer[]>(
    `/leaderboard/players?${params.toString()}`
  );
  return response.data;
};

// Get team leaderboard
export const getTeamLeaderboard = async (
  filters?: LeaderboardFilters
): Promise<TeamLeaderboard[]> => {
  const params = new URLSearchParams();
  
  if (filters?.timeframe) params.append('timeframe', filters.timeframe);
  if (filters?.format) params.append('format', filters.format);
  if (filters?.limit) params.append('_limit', filters.limit.toString());
  
  params.append('_sort', 'points');
  params.append('_order', 'desc');

  const response = await apiClient.get<TeamLeaderboard[]>(
    `/leaderboard/teams?${params.toString()}`
  );
  return response.data;
};

// Get leaderboard stats
export const getLeaderboardStats = async (): Promise<LeaderboardStats> => {
  const response = await apiClient.get<LeaderboardStats>('/leaderboard/stats');
  return response.data;
};

// Get my rank
export const getMyRank = async (): Promise<LeaderboardPlayer> => {
  const response = await apiClient.get<LeaderboardPlayer>('/leaderboard/me');
  return response.data;
};

