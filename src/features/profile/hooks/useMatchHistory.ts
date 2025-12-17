import { useQuery } from '@tanstack/react-query';
import { profileKeys } from '../api/profileKeys';
import { getMatchHistory } from '../api/profileApi';

export const useMatchHistory = (userId?: string) => {
  return useQuery({
    queryKey: profileKeys.matchHistory(userId || 'me'),
    queryFn: () => getMatchHistory(userId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

