import { useQuery } from '@tanstack/react-query';
import { walletsKeys } from '../api/walletsKeys';
import { walletsApi } from '../api/walletsApi';

export const useWalletBalance = () => {
  return useQuery({
    queryKey: walletsKeys.balance(),
    queryFn: () => walletsApi.getBalance(),
    staleTime: 30 * 1000,
  });
};
