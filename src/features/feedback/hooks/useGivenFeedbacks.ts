import { usePagination } from "@/shared/hooks";
import { GetGivenFeedbacks } from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";
import { GivenFeedbackItem } from "../types/feedback.types";

interface UseGivenFeedbacksOptions {
  pageSize?: number;
  enabled?: boolean;
  fromDate?: string;
  toDate?: string;
  rating?: number;
}

export const useGivenFeedbacks = ({
  pageSize = 10,
  enabled = true,
  fromDate,
  toDate,
  rating,
}: UseGivenFeedbacksOptions = {}) => {
  const filters = { fromDate, toDate, rating };
  const pagination = usePagination<GivenFeedbackItem>({
    queryKey: [...feedbackKeys.given(filters)],
    fetchFunction: async (page, size) => {
      const result = await GetGivenFeedbacks({ page, pageSize: size, fromDate, toDate, rating });
      return {
        data: result.items,
        totalPages: result.totalPages ?? 0,
        totalCount: result.totalCount ?? 0,
      };
    },
    pageSize,
    staleTime: 2 * 60 * 1000,
    enabled,
    onError: (error) => {
      console.error("Error fetching given feedbacks:", error);
    },
  });
  return {
    givenFeedbacks: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setGivenFeedbacks: pagination.setData,
  };
};
