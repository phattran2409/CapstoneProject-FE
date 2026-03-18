import { useMutation } from "@tanstack/react-query";
import { MatchFeedbackPayload } from "../types/feedback.types";
import { feedbackPlayer, reportPlayer, voteMatchResult } from "../api";
export const useFeedback = (matchId: string, revieweeId: string, feedbacks: MatchFeedbackPayload[]) => {
  return useMutation({
        mutationFn: () => feedbackPlayer(matchId, revieweeId, feedbacks),
        onSuccess: () => {
            console.log("Feedback given successfully");
        },
        onError: (error) => {
            console.error("Error giving feedback to player:", error);
        },
    });
};

export const useReportPlayer = (reportedUserId: string, reportType: string, description: string, matchId: string) => {
    return useMutation({
        mutationFn: () => reportPlayer(reportedUserId, reportType, description, matchId),
        onSuccess: () => {
            console.log("Player reported successfully");
        },
        onError: (error) => {
            console.error("Error reporting player:", error);
        },
    });
};

export const useVoteMatchResult = (matchId: string, teamAssignment: string) => {
    return useMutation({
        mutationFn: () => voteMatchResult(matchId, teamAssignment),
        onSuccess: () => {
            console.log("Match result voted successfully");
        },
        onError: (error) => {
            console.error("Error voting for match result:", error);
        },
    });
};