import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  GetReceivedFeedbacks,
  responseFeedback,
} from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";
import { ReceivedFeedbackItem } from "../types/feedback.types";
import { FeedbackListPaginationOptions, useFeedbackListPagination } from "./useFeedbackListPagination";

export const useReceivedFeedbacks = (options: FeedbackListPaginationOptions = {}) => {
  const { pageSize = 10, enabled = true, fromDate, toDate, rating } = options;
  const pagination = useFeedbackListPagination<ReceivedFeedbackItem>({
    pageSize,
    enabled,
    fromDate,
    toDate,
    rating,
    queryKey: (filters) => feedbackKeys.received(filters),
    fetchFunction: async ({ page, pageSize: size, filters }) => {
      const result = await GetReceivedFeedbacks({
        page,
        pageSize: size,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        rating: filters.rating,
      });
      return {
        data: result.items,
        totalPages: result.totalPages,
        totalCount: result.totalCount,
      };
    },
    staleTime: 2 * 60 * 1000,
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
