import { useMutation, useQueryClient } from "@tanstack/react-query";
import { walletsApi } from "../api/walletsApi";
import { walletsKeys } from "../api/walletsKeys";
import type { WithdrawalQuery, WithdrawalRequest, withdrawals } from "../types/wallet.types";
import { usePagination } from "@/shared/hooks";
import { withdrawalsKeys } from "../api/withdrawKeys";

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

export const useGetMyWithdrawals = (query: WithdrawalQuery, enabled: boolean = true) => {
  const pagination = usePagination<withdrawals>({
    queryKey: withdrawalsKeys.myListQuery(query),
    fetchFunction: async (page, pageSize) => {
      const result = await walletsApi.getWithdrawals({ ...query, page, pageSize });
      return {
        data: result.withdrawals,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    pageSize: query.pageSize,
    staleTime: 5 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error('Error fetching withdrawals:', error);
    },    
  });
  return {
    withdrawals: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    page: pagination.totalPages,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
  };
};