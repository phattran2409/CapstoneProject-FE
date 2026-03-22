import { apiClient } from "@/shared/api";
import type { SubmitMatchFeedbacksRequest } from "../types/feedback.types";

export const voteMatchResult = async (roomId: string, teamAssignment: string) => {
    try {
        const response = await apiClient.post(`/match-rooms/${roomId}/vote-result`, { vote: teamAssignment });
        return response;
    } catch (error) {
        console.error("Error voting for match result:", error);
        throw error;
    }
}



/**
 * Gửi toàn bộ đánh giá đồng đội một lần (batch).
 */
export const submitMatchFeedbacksBatch = async (
  body: SubmitMatchFeedbacksRequest,
) => {
  try {
    const response = await apiClient.post(`/match-feedbacks`, body);
    return response;
  } catch (error) {
    console.error("Error submitting match feedbacks batch:", error);
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

export const feedbackVenue = async (
  venueId: string,
  rating: number,
  comment: string,
) => {
try {
  const response = await apiClient.post(`/venues/reviews`, {
    venueId,
    rating,
    comment,
  });
    return response;
  } catch (error) {
    console.error("Error feedback venue:", error);
    throw error;
  }
};