import { useQuery } from "@tanstack/react-query";
import { walletsApi } from "../api/walletsApi";
import { Transaction, TransactionQuery } from "../types/wallet.types";
import { usePagination } from "@/shared/hooks";
import { walletsKeys } from "../api/walletsKeys";

export const useWalletTransaction = (query: TransactionQuery) => {
    const pagination = usePagination<Transaction>({
        queryKey: walletsKeys.transactionsQuery(query),
        fetchFunction: async (page, pageSize) => {
            const result = await walletsApi.getTransactions({ ...query, page, pageSize });
            console.log("hook result :", result.transactions);
            return {
                data: result.transactions,
                totalPages: result.totalPages,
                totalCount: result.totalCount,
            };
        },
        pageSize: query.pageSize,
        staleTime: 5 * 60 * 1000,
        enabled: true,
        onError: (error) => {
            console.error('Error fetching wallet transactions:', error);
        },
    });
    return {
        transactions: pagination.data,
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