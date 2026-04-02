import type {
  GivenFeedbackItem,
  GivenFeedbackListData,
} from "../types/feedback.types";

/**
 * Đặt `false` khi backend GET `/match-feedbacks/given` đã chạy ổn.
 */
export const USE_MOCK_GIVEN_FEEDBACK = true;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const BASE_ITEMS: GivenFeedbackItem[] = [
  {
    feedbackId: "mock-given-1",
    roomId: "room-alpha",
    matchLabel: "Giao hữu tối CN — Sân Thủ Đức",
    revieweeId: "u-10",
    revieweeName: "Minh K.",
    revieweeAvatarUrl: null,
    rating: 5,
    criteria: "Overall",
    myComment: "Chơi hay, hỗ trợ tốt!",
    givenAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    theirResponse: "Cảm ơn bạn, hẹn trận sau!",
    theyRespondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    feedbackId: "mock-given-2",
    roomId: "room-alpha",
    matchLabel: "Giao hữu tối CN — Sân Thủ Đức",
    revieweeId: "u-11",
    revieweeName: "Tuấn L.",
    revieweeAvatarUrl: null,
    rating: 4,
    criteria: "Skill",
    myComment: "Tốc độ tốt, cần thêm chuyền dài.",
    givenAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    theirResponse: null,
    theyRespondedAt: null,
  },
  {
    feedbackId: "mock-given-3",
    roomId: "room-beta",
    matchLabel: "7vs7 — Khu liên hợp Thể thao Q2",
    revieweeId: "u-12",
    revieweeName: "Hải P.",
    revieweeAvatarUrl: null,
    rating: 5,
    criteria: "Sportsmanship",
    myComment: "Fair play, vui vẻ.",
    givenAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    theirResponse: "Thanks bạn!",
    theyRespondedAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export async function fetchMockGivenFeedbacks(): Promise<GivenFeedbackListData> {
  await delay(450);
  return { items: BASE_ITEMS.map((i) => ({ ...i })), totalCount: BASE_ITEMS.length };
}
