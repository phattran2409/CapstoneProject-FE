import { apiClient } from "@/shared/api";
import { API_CONFIG } from "@/shared/constants/api";
import type {
  SubmitMatchFeedbacksRequest,
  ReceivedFeedbackItem,
  ReceivedFeedbackResponse,
  GivenFeedbackItem,
  GivenFeedbackListData,
  GivenFeedbackResponse,
  ReceivedFeedbackListData,
  GenerateSuggestionResponse,
  ReportType,
} from "../types/feedback.types";


export const voteMatchResult = async (roomId: string, teamAssignment: string) => {
  try {
    const url = API_CONFIG.ENDPOINTS.ROOMS.VOTE_RESULT.replace(':id', roomId);
    const response = await apiClient.post(url, { vote: teamAssignment });
    return response;
  } catch (error) {
    console.error("Error voting for match result:", error);
    throw error;
  }
};

/**
 * Gửi toàn bộ đánh giá đồng đội một lần (batch).
 */
export const submitMatchFeedbacksBatch = async (
  body: SubmitMatchFeedbacksRequest,
) => {
  try {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.MATCH_FEEDBACKS.CREATE, body);
    console.log('response', response);
    return response;
  } catch (error) {
    console.error("Error submitting match feedbacks batch:", error);
    throw error;
  }
};

export const reportPlayer = async (
  reportedUserId: string,
  reportType: ReportType,
  description: string,
  matchId: string,
) => {
  try {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.PLAYER_REPORTS.CREATE, {
      reportedUserId,
      reportType,
      description,
      matchId,
    });
    console.log('response', response);
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
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.VENUES.ADD_REVIEW, {
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

export interface GetFeedbacksQuery {
  fromDate?: string;
  toDate?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}

export const GetReceivedFeedbacks = async (
  getReceivedFeedbacksQuery: GetFeedbacksQuery,
): Promise<ReceivedFeedbackListData> => {
  try {
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.FEEDBACK.RECEIVED, { params: getReceivedFeedbacksQuery })) as ReceivedFeedbackResponse;
    if (response.isSuccess && response.data) {
      return {
        items: response.data.items,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch received feedbacks");
  } catch (error) {
    console.error("Error fetching received feedbacks:", error);
    throw error;
  }
};

export const GetGivenFeedbacks = async (
  getGivenFeedbacksQuery: GetFeedbacksQuery,
): Promise<GivenFeedbackListData> => {
  try {
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.FEEDBACK.GIVEN, { params: getGivenFeedbacksQuery })) as GivenFeedbackResponse;
    if (response.isSuccess && response.data) {
      return {
        items: response.data.items,
        totalPages: response.data.totalPages,
        totalCount: response.data.totalCount,
      };
    }
    throw new Error("Failed to fetch given feedbacks");
  } catch (error) {
    console.error("Error fetching given feedbacks:", error);
    throw error;
  }
};

export const responseFeedback = async (
  feedbackId: string,
  responseText: string,
) => {
  try {
    const response = await apiClient.post(API_CONFIG.ENDPOINTS.FEEDBACK.REPLY(feedbackId), { response: responseText });
    return response;
  } catch (error) {
    console.error("Error responding to feedback:", error);
    throw error;
  }
};

export const GetSuggestionComment = async (starRating: number, count: number, role: string) => {
  try {
    const response = await apiClient.post<GenerateSuggestionResponse>(API_CONFIG.ENDPOINTS.FEEDBACK.GENERATE_SUGGESTION_COMMENT, { starRating, count, role });
    return response;
  } catch (error) {
    console.error("Error generating suggestion comment:", error);
    throw error;
  }
};