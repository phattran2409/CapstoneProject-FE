import { apiClient } from "@/shared/api";
import { MatchFeedbackPayload } from "../types/feedback.types";



export const voteMatchResult = async (roomId: string, teamAssignment: string) => {
    try {
        const response = await apiClient.post(`/match-rooms/${roomId}/vote-result`, { vote: teamAssignment });
        return response;
    } catch (error) {
        console.error("Error voting for match result:", error);
        throw error;
    }
}



export const feedbackPlayer = async (
  matchId: string,
  revieweeId: string,
  feedbacks: MatchFeedbackPayload[],
) => {
  try {
    const response = await apiClient.post(`/match-feedbacks`, {
      matchId,
      revieweeId,
      feedbacks,
    });
    return response;
  } catch (error) {
    console.error("Error giving feedback to player:", error);
    throw error;
  }
};

export const reportPlayer = async (
    reportedUserId: string,
  reportType: string,
  description: string,
  matchId: string,
) => {
  try {
    const response = await apiClient.post(`/match-feedbacks/${matchId}/report`, {
      reportedUserId,
      reportType,
      description,
      matchId,
    });
    return response;
  } catch (error) {
    console.error("Error reporting player:", error);
    throw error;
  }
};