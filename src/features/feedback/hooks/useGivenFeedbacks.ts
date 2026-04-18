import { GetGivenFeedbacks } from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";
import { GivenFeedbackItem } from "../types/feedback.types";

import {
  FeedbackListPaginationOptions,
  useFeedbackListPagination,
} from "./useFeedbackListPagination";

export const useGivenFeedbacks = ({
  pageSize,
  enabled = true,
  fromDate,
  toDate,
  rating,
}: FeedbackListPaginationOptions = {}) => {
  const pagination = useFeedbackListPagination<GivenFeedbackItem>({
    pageSize,
    enabled,
    fromDate,
    toDate,
    rating,
    queryKey: (filters) => feedbackKeys.given(filters),
    fetchFunction: async ({ page, pageSize: size, filters }) => {
      const result = await GetGivenFeedbacks({
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
