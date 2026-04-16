/**
 * Một dòng đánh giá trong batch (theo contract BE).
 * Mỗi phần tử = 1 người được review.
 */
export interface MatchFeedbackBatchItem {
  feedbackId: string;
  revieweeId: string;
  comment: string;
  rating: number;
}

export interface FeedbackVenueVariables {
  venueId: string;
  rating: number;
  comment: string;
  /** Để invalidate chi tiết phòng sau khi BE cập nhật hasLeftFeedback */
  roomId?: string;
}

/**
 * Body POST batch đánh giá đồng đội.
 */
export interface SubmitMatchFeedbacksRequest {
  matchId: string;
  reviewerId: string;
  feedbacks: MatchFeedbackBatchItem[];
}

/**
 * ID dimension/template feedback từ backend — thay bằng GUID thật khi BE cung cấp.
 */
export const DEFAULT_PLAYER_FEEDBACK_ID =
  "00000000-0000-0000-0000-000000000001";

/** FR-27/28: feedback người chơi nhận được từ người khác */
export interface ReceivedFeedbackItem {
  feedbackId: string;
  matchId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  comment: string;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  revieweeResponse: string | null;
  responseDate: string;
  createdAt: string;
}

export interface ReceivedFeedbackListData {
  items: ReceivedFeedbackItem[];
  totalCount?: number;
  totalPages?: number;
}

export interface ReceivedFeedbackResponse {
  isSuccess: boolean;
  data: {
    items: ReceivedFeedbackItem[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export interface GivenFeedbackResponse {
  isSuccess: boolean;
  data: {
    items: GivenFeedbackItem[];
    totalPages: number;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}


/** Feedback do mình gửi cho người khác; xem họ có phản hồi lại không */
export interface GivenFeedbackItem {
  feedbackId: string;
  matchId: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatarUrl: string | null;
  rating: number;
  comment: string;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  revieweeResponse: string | null;
  responseDate: string;
  createdAt: string;
}

export interface GivenFeedbackListData {
  items: GivenFeedbackItem[];
  totalCount?: number;
  totalPages: number;
}

export const RECEIVED_FEEDBACK_REPLY_MAX_LENGTH = 200;

export type GenerateSuggesionVars = {
  starRating : number;
  count : number, 
  role: string
}

export interface GenerateSuggestionResponse {
  starRating : number;
  suggestions: string[];
  source: string;
  modelUsed: string;
}