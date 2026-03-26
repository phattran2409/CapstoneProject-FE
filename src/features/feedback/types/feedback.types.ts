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
