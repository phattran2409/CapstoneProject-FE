import type { MatchRoomStatus } from "@/features/rooms";

/** Key i18n: `matchRoomStatus.${status}` — dùng với `t(matchRoomStatusI18nKey(status))`. */
export function matchRoomStatusI18nKey(
  status: MatchRoomStatus,
): `matchRoomStatus.${MatchRoomStatus}` {
  return `matchRoomStatus.${status}`;
}

