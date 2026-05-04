import type { MatchRoomFullInfo, MatchRoomStatus } from "../types/room.types";

/**
 * Dùng khi dev/test flow feedback mà BE chưa trả status `Reviewing`.
 *
 * Cách dùng:
 * 1. Đặt `ENABLED = true` bên dưới
 * 2. Mở bất kỳ phòng nào (đã load được detail) → UI sẽ coi như đang ở trạng thái test
 * 3. Test xong nhớ đặt lại `ENABLED = false` trước khi commit
 *
 * Lưu ý: chỉ ép **hiển thị** status trên app. API vote / feedback vẫn do BE kiểm tra;
 * nếu BE yêu cầu phòng đã `Reviewing` thật trong DB, cần đổi dữ liệu phía server hoặc mock API.
 *
 * Production: luôn `false` (không phụ thuộc __DEV__ cho flag commit nhầm).
 */
export const ROOM_FEEDBACK_TEST = {
  /** Đổi thành true khi cần test */
  ENABLED: false,

  /** Ép status hiển thị & logic action bar (vd: nút "Đánh giá trận đấu") */
  forceStatus: "Reviewing" as MatchRoomStatus,

  /** `true` = giả đã gửi feedback → thấy trạng thái "Bạn đã đánh giá" */
  forceHasLeftFeedback: false,
} as const;

export function applyRoomFeedbackTestOverrides(
  room: MatchRoomFullInfo,
): MatchRoomFullInfo {
  if (!__DEV__ || !ROOM_FEEDBACK_TEST.ENABLED) {
    return room;
  }
  return {
    ...room,
    status: ROOM_FEEDBACK_TEST.forceStatus,
    hasLeftFeedback: ROOM_FEEDBACK_TEST.forceHasLeftFeedback,
  };
}
