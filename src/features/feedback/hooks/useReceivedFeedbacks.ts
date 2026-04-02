import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReceivedFeedbacks,
  replyToReceivedFeedback,
  type GetReceivedFeedbacksQuery,
} from "../api/feedbackApi";
import { feedbackKeys } from "../api/feedbackKeys";

export function useReceivedFeedbacks(query?: GetReceivedFeedbacksQuery) {
  return useQuery({
    queryKey: feedbackKeys.received(query),
    queryFn: () => getReceivedFeedbacks(query),
  });
}

export function useReplyToReceivedFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      feedbackId,
      responseText,
    }: {
      feedbackId: string;
      responseText: string;
    }) => replyToReceivedFeedback(feedbackId, responseText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbackKeys.all });
    },
  });
}
