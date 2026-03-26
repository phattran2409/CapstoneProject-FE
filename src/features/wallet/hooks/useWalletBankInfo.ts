import { useMutation, useQueryClient } from "@tanstack/react-query";
import { walletsApi } from "../api/walletsApi";
import { walletsKeys } from "../api/walletsKeys";
import type { BankInfoRequest, WalletBalance } from "../types/wallet.types";

export const useWalletBankInfo = () => {
  const queryClient = useQueryClient();

  return useMutation<WalletBalance, Error, BankInfoRequest>({
    mutationFn: (payload: BankInfoRequest) => walletsApi.updateBankInfo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletsKeys.balance() });
      queryClient.invalidateQueries({ queryKey: walletsKeys.bankInfo() });
    },
  });
};

