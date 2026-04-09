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
  roomId: string;
  matchLabel: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  /** Tiêu chí / dimension (VD: Overall, Skill, …) */
  criteria: string;
  comment: string;
  receivedAt: string;
  sentimentScore?: number | null;
  sentimentLabel?: string | null;
  myResponse: string | null;
  respondedAt: string | null;
}

export interface ReceivedFeedbackListData {
  items: ReceivedFeedbackItem[];
  totalCount?: number;
}

/** Feedback do mình gửi cho người khác; xem họ có phản hồi lại không */
export interface GivenFeedbackItem {
  feedbackId: string;
  roomId: string;
  matchLabel: string;
  revieweeId: string;
  revieweeName: string;
  revieweeAvatarUrl: string | null;
  /** Sao mình đã chấm cho họ */
  rating: number;
  criteria: string;
  /** Nội dung mình viết khi đánh giá */
  myComment: string;
  givenAt: string;
  sentimentScore?: number | null;
  sentimentLabel?: string | null;
  /** Phản hồi text của người được đánh giá (nếu có) */
  theirResponse: string | null;
  theyRespondedAt: string | null;
}

export interface GivenFeedbackListData {
  items: GivenFeedbackItem[];
  totalCount?: number;
}

export const RECEIVED_FEEDBACK_REPLY_MAX_LENGTH = 200;
