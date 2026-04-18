import { leaderboardKeys } from '../api/leaderboardKeys';
import { getLeaderboardPlayers, getMyRank } from '../api/leaderboardApi';
import { LEADERBOARD_PAGE_SIZE } from '../constants';
import { useQuery } from '@tanstack/react-query';

export type UseLeaderboardOptions = {
  /** Mặc định 50 — khớp với LEADERBOARD_PAGE_SIZE. */
  pageSize?: number;
};

export const useLeaderboard = (options: UseLeaderboardOptions = {}) => {
  const pageSize = options.pageSize ?? LEADERBOARD_PAGE_SIZE;
  return useQuery({
    queryKey: leaderboardKeys.list(1, pageSize),
    queryFn: () => getLeaderboardPlayers({ page: 1, pageSize }),
    staleTime: 2 * 60 * 1000,
    enabled: true,
  });
};


export const useMyRank = () => {
  return useQuery({
    queryKey: leaderboardKeys.myRank(),
    queryFn: getMyRank,
    staleTime: 2 * 60 * 1000,
    enabled: true,
  });
};
