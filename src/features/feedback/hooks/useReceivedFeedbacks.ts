import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  GetReceivedFeedbacks,
  responseFeedback,
  type GetReceivedFeedbacksQuery,
} from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";
import { Friend } from "@/features/friends/types/friends.types";
import { usePagination } from "@/shared/hooks";
import { ReceivedFeedbackItem } from "../types/feedback.types";


interface UsePaginatedReceivedFeedbacksOptions {
  pageSize?: number;
  enabled?: boolean;
  fromDate?: string;
  toDate?: string;
  rating?: number;
}
export const useReceivedFeedbacks = ({
  pageSize = 10,
  enabled = true,
  fromDate,
  toDate,
  rating,
}: UsePaginatedReceivedFeedbacksOptions = {}) => {
  const filters = { fromDate, toDate, rating };
  const pagination = usePagination<ReceivedFeedbackItem>({
    queryKey: [...feedbackKeys.received(filters)],
    fetchFunction: async (page, size) => {
      const result = await GetReceivedFeedbacks({ page, pageSize: size, fromDate, toDate, rating });
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
      console.error("Error fetching received feedbacks:", error);
    },
  });
  return {
    receivedFeedbacks: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setReceivedFeedbacks: pagination.setData,
  };
};


export function useReplyToReceivedFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
      responseText,
    }: {
      feedbackId: string;
      responseText: string;
    }) => responseFeedback(feedbackId, responseText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
    onError: (error) => {
      console.error("Error responding to feedback:", error);
    },
  });
}
