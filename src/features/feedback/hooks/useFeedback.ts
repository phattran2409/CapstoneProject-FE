import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FeedbackVenueVariables, GenerateSuggesionVars, GenerateSuggestionResponse, SubmitMatchFeedbacksRequest } from "../types/feedback.types";
import { submitMatchFeedbacksBatch, reportPlayer, voteMatchResult, feedbackVenue, GetSuggestionComment } from "../api";
import { roomsKeys } from "@/features/rooms/api/roomsKeys";
import { roomsApi } from "@/features/rooms/api/roomsApi";
import type { MatchRoomFullInfo } from "@/features/rooms/types/room.types";
import { venuesKeys } from "@/features/venues/api/venuesKeys";
import { profileKeys } from "@/features/profile/api/profileKeys";
import { getMyRadarChart } from "@/features/profile/api/profileApi";
import { breakdownKeys } from "@/features/breakdown/api/breakdownKeys";
import { getEloBreakdown } from "@/features/breakdown/api/breakdownApi";

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(() => resolve(), ms));

const triggerPostMatchAiPolling = async (
  queryClient: ReturnType<typeof useQueryClient>,
  matchId: string,
) => {
  try {
    const currentRadar = await queryClient.fetchQuery({
      queryKey: profileKeys.radarChart(),
      queryFn: getMyRadarChart,
      staleTime: 0,
    });
    const baselineUpdatedAt = currentRadar?.updatedAt ?? "";
    const baselineBreakdownCount =
      (
        await queryClient.fetchQuery({
          queryKey: breakdownKeys.eloBreakdown(matchId),
          queryFn: () => getEloBreakdown({ matchId }),
          staleTime: 0,
        })
      )?.length ?? 0;

    for (let i = 0; i < 6; i += 1) {
      await sleep(i === 0 ? 5000 : 12000);
      const [nextRadar, nextBreakdown] = await Promise.all([
        queryClient.fetchQuery({
          queryKey: profileKeys.radarChart(),
          queryFn: getMyRadarChart,
          staleTime: 0,
        }),
        queryClient.fetchQuery({
          queryKey: breakdownKeys.eloBreakdown(matchId),
          queryFn: () => getEloBreakdown({ matchId }),
          staleTime: 0,
        }),
      ]);

      const radarChanged =
        !!nextRadar?.updatedAt && nextRadar.updatedAt !== baselineUpdatedAt;
      const breakdownChanged = (nextBreakdown?.length ?? 0) > baselineBreakdownCount;

      if (radarChanged || breakdownChanged) {
        void queryClient.invalidateQueries({ queryKey: profileKeys.radarChart() });
        void queryClient.invalidateQueries({
          queryKey: breakdownKeys.eloBreakdown(matchId),
        });
        void queryClient.invalidateQueries({
          queryKey: breakdownKeys.eloBreakdown(undefined),
        });
        break;
      }
    }
  } catch {
    // Silent fail: polling is best-effort and should never block UI flow.
  }
};

const waitForRoomCompleted = async (
  queryClient: ReturnType<typeof useQueryClient>,
  matchId: string,
): Promise<boolean> => {
  try {
    for (let i = 0; i < 12; i += 1) {
      if (i > 0) {
        await sleep(10000);
      }
      const room = await queryClient.fetchQuery({
        queryKey: roomsKeys.detail(matchId),
        queryFn: () => roomsApi.getRoomFullInfo(matchId),
        staleTime: 0,
      });
      if ((room as MatchRoomFullInfo | undefined)?.status === "Completed") {
        return true;
      }
    }
  } catch {
    // Ignore failure and keep UI flow non-blocking.
  }
  return false;
};

const triggerPostSubmitPolling = async (
  queryClient: ReturnType<typeof useQueryClient>,
  matchId: string,
) => {
  // One lightweight refresh right after submit (hybrid flow).
  void queryClient.invalidateQueries({ queryKey: roomsKeys.detail(matchId) });

  const isCompleted = await waitForRoomCompleted(queryClient, matchId);
  if (!isCompleted) return;

  await triggerPostMatchAiPolling(queryClient, matchId);
};

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

      // Poll only when room is completed (close reviewing).
      void triggerPostSubmitPolling(queryClient, body.matchId);
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


export const useGenerateSuggestionComment = () => {
  return useMutation({
    mutationFn: async (
      vars: GenerateSuggesionVars,
    ): Promise<GenerateSuggestionResponse> => {
      const response = await GetSuggestionComment(
        vars.starRating,
        vars.count,
        vars.role,
      );
      const payload = (response as any)?.data ?? response;
      return payload as GenerateSuggestionResponse;
    },
  });
};