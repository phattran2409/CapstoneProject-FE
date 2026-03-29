import type { MatchRoomFullInfo } from "../types/room.types";

/**
 * Tên đội hiển thị: ưu tiên `teamNames` (API PATCH team-name), sau đó `formations.*.teamName`.
 */
export function getResolvedTeamDisplayName(
  room: MatchRoomFullInfo | null | undefined,
  selectedTeam: "teamA" | "teamB",
  defaultLabel: string,
): string {
  if (!room) return defaultLabel;
  const key = selectedTeam === "teamA" ? "A" : "B";
  const fromNames = room.teamNames?.[key]?.trim();
  const fromFormation = room.formations?.[selectedTeam]?.teamName?.trim();
  return (fromNames || fromFormation || defaultLabel).trim() || defaultLabel;
}
