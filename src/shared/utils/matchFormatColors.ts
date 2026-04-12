/**
 * Màu accent cho badge định dạng trận (5vs5 / 7vs7 / 11vs11) — dùng chung cho preset, danh sách match, v.v.
 */
export const MATCH_FORMAT_BADGE_COLORS: Record<string, string> = {
  "5vs5": "#3B82F6",
  "7vs7": "#F59E0B",
  "11vs11": "#EF4444",
};

export function getMatchFormatBadgeColor(
  formatLabel: string | undefined,
  fallback: string,
): string {
  if (!formatLabel) return fallback;
  return MATCH_FORMAT_BADGE_COLORS[formatLabel] ?? fallback;
}
