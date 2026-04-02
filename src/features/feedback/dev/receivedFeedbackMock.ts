import type {
  ReceivedFeedbackItem,
  ReceivedFeedbackListData,
} from "../types/feedback.types";

/**
 * Đặt `false` khi backend GET/POST đã chạy ổn.
 */
export const USE_MOCK_RECEIVED_FEEDBACK = true;

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Phản hồi user gửi trong phiên (chỉ mock) */
const mockReplyById: Record<string, { text: string; at: string }> = {};

const BASE_ITEMS: ReceivedFeedbackItem[] = [
  {
    feedbackId: "mock-fb-1",
    roomId: "room-alpha",
    matchLabel: "Giao hữu tối CN — Sân Thủ Đức",
    reviewerId: "u-1",
    reviewerName: "Nguyễn Văn A",
    reviewerAvatarUrl: null,
    rating: 5,
    criteria: "Skill",
    comment: "Chơi tốt, phối hợp ăn ý. Hẹn trận sau!",
    receivedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    myResponse: null,
    respondedAt: null,
  },
  {
    feedbackId: "mock-fb-2",
    roomId: "room-alpha",
    matchLabel: "Giao hữu tối CN — Sân Thủ Đức",
    reviewerId: "u-2",
    reviewerName: "Trần Thị B",
    reviewerAvatarUrl: null,
    rating: 4,
    criteria: "Sportsmanship",
    comment: "Fair play, không tranh cãi trọng tài.",
    receivedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    myResponse: "Cảm ơn bạn, chúc bạn giữ phong độ!",
    respondedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    feedbackId: "mock-fb-3",
    roomId: "room-beta",
    matchLabel: "7vs7 — Khu liên hợp Thể thao Q2",
    reviewerId: "u-3",
    reviewerName: "Lê C",
    reviewerAvatarUrl: null,
    rating: 3,
    criteria: "Punctuality",
    comment: "Đến muộn 10p nhưng đã báo trước.",
    receivedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    myResponse: null,
    respondedAt: null,
  },
  {
    feedbackId: "mock-fb-4",
    roomId: "room-gamma",
    matchLabel: "11vs11 — Weekend League",
    reviewerId: "u-4",
    reviewerName: "Phạm D",
    reviewerAvatarUrl: null,
    rating: 5,
    criteria: "Overall",
    comment: "Captain rất ổn, chia bài hợp lý.",
    receivedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    myResponse: null,
    respondedAt: null,
  },
  {
    feedbackId: "mock-fb-5",
    roomId: "room-gamma",
    matchLabel: "11vs11 — Weekend League",
    reviewerId: "u-5",
    reviewerName: "Hoàng E",
    reviewerAvatarUrl: null,
    rating: 2,
    criteria: "Skill",
    comment: "Cần cải thiện pressing cao hơn một chút.",
    receivedAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
    myResponse: null,
    respondedAt: null,
  },
];

export async function fetchMockReceivedFeedbacks(): Promise<ReceivedFeedbackListData> {
  await delay(450);
  const items: ReceivedFeedbackItem[] = BASE_ITEMS.map((item) => {
    const live = mockReplyById[item.feedbackId];
    if (live) {
      return {
        ...item,
        myResponse: live.text,
        respondedAt: live.at,
      };
    }
    return { ...item };
  });
  return { items, totalCount: items.length };
}

export async function submitMockReceivedReply(
  feedbackId: string,
  responseText: string,
): Promise<void> {
  await delay(350);
  mockReplyById[feedbackId] = {
    text: responseText,
    at: new Date().toISOString(),
  };
}
