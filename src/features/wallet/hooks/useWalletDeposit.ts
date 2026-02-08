import { useMutation, useQueryClient } from '@tanstack/react-query';
import { walletsKeys } from '../api/walletsKeys';
import { walletsApi } from '../api/walletsApi';
import type { DepositResponse } from '../types/wallet.types';

export const useWalletDeposit = () => {
  const queryClient = useQueryClient();

  return useMutation<DepositResponse, Error, number>({
    mutationFn: (amount: number) => walletsApi.deposit({ amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKeys.balance() });
    },
  });
};
