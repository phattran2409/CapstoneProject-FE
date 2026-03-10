
import { leaderboardKeys } from '../api/leaderboardKeys';
import { getLeaderboardPlayers, getMyRank } from '../api/leaderboardApi';
import { Leaderboard } from '../types/leaderboard.types';
import { usePagination } from '@/shared/hooks/usePagination';
import { useQuery } from '@tanstack/react-query';


export const useLeaderboard = () => {
  return useQuery({
    queryKey: leaderboardKeys.list(),
    queryFn: getLeaderboardPlayers,
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
