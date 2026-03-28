import { useQuery } from "@tanstack/react-query";
import { getGivenFeedbacks, type GetGivenFeedbacksQuery } from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";

export function useGivenFeedbacks(query?: GetGivenFeedbacksQuery) {
  return useQuery({
    queryKey: feedbackKeys.given(query),
    queryFn: () => getGivenFeedbacks(query),
  });
}
