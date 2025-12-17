import { useQuery } from '@tanstack/react-query';
import { leaderboardKeys } from '../api/leaderboardKeys';
import {
  getPlayerLeaderboard,
  getTeamLeaderboard,
  getLeaderboardStats,
  getMyRank,
} from '../api/leaderboardApi';
import { LeaderboardFilters } from '../types/leaderboard.types';

// Get player leaderboard
export const usePlayerLeaderboard = (filters?: LeaderboardFilters) => {
  return useQuery({
    queryKey: leaderboardKeys.playerList(filters),
    queryFn: () => getPlayerLeaderboard(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Get team leaderboard
export const useTeamLeaderboard = (filters?: LeaderboardFilters) => {
  return useQuery({
    queryKey: leaderboardKeys.teamList(filters),
    queryFn: () => getTeamLeaderboard(filters),
    staleTime: 2 * 60 * 1000,
  });
};

// Get leaderboard stats
export const useLeaderboardStats = () => {
  return useQuery({
    queryKey: leaderboardKeys.stats(),
    queryFn: getLeaderboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get my rank
export const useMyRank = () => {
  return useQuery({
    queryKey: leaderboardKeys.myRank(),
    queryFn: getMyRank,
    staleTime: 2 * 60 * 1000,
  });
};

