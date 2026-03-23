import { useMutation, useQueryClient } from "@tanstack/react-query";
import { walletsApi } from "../api/walletsApi";
import { walletsKeys } from "../api/walletsKeys";
import type { WithdrawalRequest } from "../types/wallet.types";

export const useWithdrawal = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, WithdrawalRequest>({
    mutationFn: (payload: WithdrawalRequest) =>
      walletsApi.createWithdrawal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: walletsKeys.transactions() });
    },
  });
};
