
import { leaderboardKeys } from '../api/leaderboardKeys';
import { getLeaderboardPlayers } from '../api/leaderboardApi';
import { Players } from '../types/leaderboard.types';
import { usePagination } from '@/shared/hooks/usePagination';

interface UsePaginatedLeaderboardOptions {
  pageSize?: number;
  enabled?: boolean;
}

export const usePaginatedPlayers = ({
  pageSize = 10,
  enabled = true,
}: UsePaginatedLeaderboardOptions = {}) => {
  const pagination = usePagination<Players>({
    queryKey: [...leaderboardKeys.playerList()],
    fetchFunction: async (page, size) => {
      const result = await getLeaderboardPlayers({
        page,
        pageSize: size,
        sortBy: 'currentElo',
      });
      return {
        data: result.users,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching leaderboard players:", error);
    },
  });

  return {
    users: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setUsers: pagination.setData,
  };
};
