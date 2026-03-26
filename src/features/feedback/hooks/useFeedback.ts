import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FeedbackVenueVariables, SubmitMatchFeedbacksRequest } from "../types/feedback.types";
import { submitMatchFeedbacksBatch, reportPlayer, voteMatchResult, feedbackVenue } from "../api";
import { roomsKeys } from "@/features/rooms/api/roomsKeys";
import { venuesKeys } from "@/features/venues/api/venuesKeys";

// ==================== Batch submit teammate feedbacks ====================

/**
 * Gửi một request: matchId + reviewerId + mảng feedbacks (mỗi phần tử một reviewee).
 */
export const useSubmitMatchFeedbacksBatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: SubmitMatchFeedbacksRequest) =>
      submitMatchFeedbacksBatch(body),
    onSuccess: (_data, body) => {
      void queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(body.matchId),
      });
      void queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
      void queryClient.invalidateQueries({ queryKey: roomsKeys.myRooms() });
    },
  });
};

/**
 * Đánh giá venue/sân: POST `/venues/reviews` với venueId.
 */
export const useFeedbackVenue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: FeedbackVenueVariables) =>
      feedbackVenue(vars.venueId, vars.rating, vars.comment),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: venuesKeys.detail(vars.venueId),
      });
      void queryClient.invalidateQueries({
        queryKey: venuesKeys.reviews(vars.venueId),
      });
      if (vars.roomId) {
        void queryClient.invalidateQueries({
          queryKey: roomsKeys.detail(vars.roomId),
        });
        void queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
        void queryClient.invalidateQueries({ queryKey: roomsKeys.myRooms() });
      }
    },
  });
};
// ==================== Report player ====================

export interface ReportPlayerVariables {
  reportedUserId: string;
  reportType: string;
  description: string;
  matchId: string;
}

export const useReportPlayer = () => {
  return useMutation({
    mutationFn: (vars: ReportPlayerVariables) =>
      reportPlayer(
        vars.reportedUserId,
        vars.reportType,
        vars.description,
        vars.matchId,
      ),
  });
};

// ==================== Vote match result ====================

export interface VoteMatchResultVariables {
  roomId: string;
  vote: string;
}

export const useVoteMatchResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: VoteMatchResultVariables) =>
      voteMatchResult(vars.roomId, vars.vote),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(vars.roomId),
      });
      void queryClient.invalidateQueries({ queryKey: roomsKeys.matchRooms() });
      void queryClient.invalidateQueries({ queryKey: roomsKeys.myRooms() });
    },
  });
};
