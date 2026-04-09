import { apiClient } from "@/shared/api";
import { API_CONFIG } from "@/shared/constants/api";
import type {
  SubmitMatchFeedbacksRequest,
  ReceivedFeedbackItem,
  ReceivedFeedbackListData,
  GivenFeedbackItem,
  GivenFeedbackListData,
} from "../types/feedback.types";
import {
  USE_MOCK_RECEIVED_FEEDBACK,
  fetchMockReceivedFeedbacks,
  submitMockReceivedReply,
} from "../dev/receivedFeedbackMock";
import {
  USE_MOCK_GIVEN_FEEDBACK,
  fetchMockGivenFeedbacks,
} from "../dev/givenFeedbackMock";

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
    console.log('response', response);
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
    const response = await apiClient.post(`/player-reports`, {
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

export interface GetReceivedFeedbacksQuery {
  fromDate?: string;
  toDate?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}

export interface GetGivenFeedbacksQuery {
  fromDate?: string;
  toDate?: string;
  rating?: number;
  page?: number;
  pageSize?: number;
}

function parseReceivedFeedbackItem(raw: Record<string, unknown>): ReceivedFeedbackItem | null {
  const feedbackId = String(raw.feedbackId ?? raw.id ?? "");
  if (!feedbackId) return null;
  return {
    feedbackId,
    roomId: String(raw.roomId ?? raw.matchId ?? ""),
    matchLabel: String(raw.matchLabel ?? raw.matchName ?? raw.roomName ?? ""),
    reviewerId: String(raw.reviewerId ?? raw.fromUserId ?? ""),
    reviewerName: String(raw.reviewerName ?? raw.reviewerFullName ?? ""),
    reviewerAvatarUrl:
      typeof raw.reviewerAvatarUrl === "string" ? raw.reviewerAvatarUrl : null,
    rating: Number(raw.rating ?? raw.score ?? 0) || 0,
    criteria: String(raw.criteria ?? raw.dimension ?? raw.category ?? "Overall"),
    comment: String(raw.comment ?? raw.messageText ?? ""),
    receivedAt: String(raw.receivedAt ?? raw.createdAt ?? raw.sentAt ?? ""),
    sentimentScore:
      raw.sentimentScore != null ? Number(raw.sentimentScore) : null,
    sentimentLabel:
      raw.sentimentLabel != null ? String(raw.sentimentLabel) : null,
    myResponse:
      raw.myResponse != null && raw.myResponse !== ""
        ? String(raw.myResponse)
        : raw.revieweeResponse != null && raw.revieweeResponse !== ""
          ? String(raw.revieweeResponse)
          : raw.responseText != null && raw.responseText !== ""
            ? String(raw.responseText)
            : null,
    respondedAt:
      raw.responseDate != null
        ? String(raw.responseDate)
        : raw.respondedAt != null
          ? String(raw.respondedAt)
          : raw.repliedAt != null
            ? String(raw.repliedAt)
            : null,
  };
}

function parseReceivedListResponse(raw: unknown): ReceivedFeedbackListData {
  let itemsRaw: unknown[] = [];
  if (Array.isArray(raw)) {
    itemsRaw = raw;
  } else if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if ("isSuccess" in o && o.isSuccess && o.data && typeof o.data === "object") {
      const d = o.data as Record<string, unknown>;
      if (Array.isArray(d.items)) itemsRaw = d.items;
      else if (Array.isArray(d.feedbacks)) itemsRaw = d.feedbacks;
      else if (Array.isArray(d.data)) itemsRaw = d.data;
    } else if (Array.isArray(o.items)) itemsRaw = o.items;
    else if (Array.isArray(o.feedbacks)) itemsRaw = o.feedbacks;
  }
  const items: ReceivedFeedbackItem[] = [];
  for (const row of itemsRaw) {
    if (row && typeof row === "object") {
      const parsed = parseReceivedFeedbackItem(row as Record<string, unknown>);
      if (parsed) items.push(parsed);
    }
  }
  return { items };
}

function parseGivenFeedbackItem(raw: Record<string, unknown>): GivenFeedbackItem | null {
  const feedbackId = String(raw.feedbackId ?? raw.id ?? "");
  if (!feedbackId) return null;
  const theirResponseRaw =
    raw.theirResponse ?? raw.revieweeReply ?? raw.revieweeResponse ?? raw.responseFromReviewee;
  const theyAtRaw = raw.theyRespondedAt ?? raw.revieweeRepliedAt ?? raw.respondedAt;
  return {
    feedbackId,
    roomId: String(raw.roomId ?? raw.matchId ?? ""),
    matchLabel: String(raw.matchLabel ?? raw.matchName ?? raw.roomName ?? ""),
    revieweeId: String(raw.revieweeId ?? raw.toUserId ?? raw.recipientId ?? ""),
    revieweeName: String(raw.revieweeName ?? raw.revieweeFullName ?? raw.toUserName ?? ""),
    revieweeAvatarUrl:
      typeof raw.revieweeAvatarUrl === "string" ? raw.revieweeAvatarUrl : null,
    rating: Number(raw.rating ?? raw.score ?? 0) || 0,
    criteria: String(raw.criteria ?? raw.dimension ?? raw.category ?? "Overall"),
    myComment: String(raw.myComment ?? raw.comment ?? raw.messageText ?? ""),
    givenAt: String(raw.givenAt ?? raw.createdAt ?? raw.sentAt ?? ""),
    sentimentScore:
      raw.sentimentScore != null ? Number(raw.sentimentScore) : null,
    sentimentLabel:
      raw.sentimentLabel != null ? String(raw.sentimentLabel) : null,
    theirResponse:
      theirResponseRaw != null && String(theirResponseRaw).trim() !== ""
        ? String(theirResponseRaw)
        : null,
    theyRespondedAt:
      theyAtRaw != null && String(theyAtRaw).trim() !== ""
        ? String(theyAtRaw)
        : null,
  };
}

function parseGivenListResponse(raw: unknown): GivenFeedbackListData {
  let itemsRaw: unknown[] = [];
  if (Array.isArray(raw)) {
    itemsRaw = raw;
  } else if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if ("isSuccess" in o && o.isSuccess && o.data && typeof o.data === "object") {
      const d = o.data as Record<string, unknown>;
      if (Array.isArray(d.items)) itemsRaw = d.items;
      else if (Array.isArray(d.feedbacks)) itemsRaw = d.feedbacks;
      else if (Array.isArray(d.data)) itemsRaw = d.data;
    } else if (Array.isArray(o.items)) itemsRaw = o.items;
    else if (Array.isArray(o.feedbacks)) itemsRaw = o.feedbacks;
  }
  const items: GivenFeedbackItem[] = [];
  for (const row of itemsRaw) {
    if (row && typeof row === "object") {
      const parsed = parseGivenFeedbackItem(row as Record<string, unknown>);
      if (parsed) items.push(parsed);
    }
  }
  return { items };
}

/**
 * FR-27: danh sách feedback nhận được (query tùy chọn cho BE).
 */
export const getReceivedFeedbacks = async (
  query?: GetReceivedFeedbacksQuery,
): Promise<ReceivedFeedbackListData> => {
  if (USE_MOCK_RECEIVED_FEEDBACK) {
    return fetchMockReceivedFeedbacks();
  }
  const params: Record<string, string | number> = {};
  if (query?.fromDate) params.fromDate = query.fromDate;
  if (query?.toDate) params.toDate = query.toDate;
  if (query?.rating != null) params.rating = query.rating;
  if (query?.page != null) params.page = query.page;
  if (query?.pageSize != null) params.pageSize = query.pageSize;
  const raw = await apiClient.get("/playerprofiles/me/feedbacks/received", {
    params,
  });
  return parseReceivedListResponse(raw);
};

/**
 * Danh sách feedback mình đã gửi + phản hồi từ người được đánh giá (nếu BE hỗ trợ).
 */
export const getGivenFeedbacks = async (
  query?: GetGivenFeedbacksQuery,
): Promise<GivenFeedbackListData> => {
  if (USE_MOCK_GIVEN_FEEDBACK) {
    return fetchMockGivenFeedbacks();
  }
  const params: Record<string, string | number> = {};
  if (query?.fromDate) params.fromDate = query.fromDate;
  if (query?.toDate) params.toDate = query.toDate;
  if (query?.rating != null) params.rating = query.rating;
  if (query?.page != null) params.page = query.page;
  if (query?.pageSize != null) params.pageSize = query.pageSize;
  const raw = await apiClient.get("/playerprofiles/me/feedbacks/given", {
    params,
  });
  return parseGivenListResponse(raw);
};

/**
 * FR-28: phản hồi text tối đa 200 ký tự (validate ở UI).
 */
export const replyToReceivedFeedback = async (
  feedbackId: string,
  responseText: string,
): Promise<void> => {
  if (USE_MOCK_RECEIVED_FEEDBACK) {
    return submitMockReceivedReply(feedbackId, responseText);
  }
  const url = API_CONFIG.ENDPOINTS.FEEDBACK.REPLY(feedbackId);
  await apiClient.post(url, { responseText });
};