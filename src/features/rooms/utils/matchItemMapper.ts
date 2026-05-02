import type { MatchItemData } from "@/shared/components";
import { formatDateWithTodayLabel } from "@/shared/utils/dateUtils";
import type { MatchRoom, MyRoom, MatchFormat } from "../types/room.types";

const formatMap: Record<MatchFormat, string> = {
  FiveVsFive: "5vs5",
  SevenVsSeven: "7vs7",
  ElevenVsEleven: "11vs11",
};

function formatTimeRange(startTime?: string, endTime?: string): string | undefined {
  const s = startTime ? String(startTime).substring(0, 5) : "";
  const e = endTime ? String(endTime).substring(0, 5) : "";
  if (!s && !e) return undefined;
  if (!e) return s;
  if (!s) return e;
  return `${s} - ${e}`;
}

export function toMatchItemData(input: MatchRoom): MatchItemData;
export function toMatchItemData(input: MyRoom): MatchItemData;
export function toMatchItemData(input: MatchRoom | MyRoom): MatchItemData {
  const isMyRoom = (value: MatchRoom | MyRoom): value is MyRoom =>
    (value as MyRoom).field !== undefined && (value as any).venueName === undefined;

  if (isMyRoom(input)) {
    return {
      id: String(input.roomId ?? ""),
      title: input.roomName ?? "Untitled",
      format: input.matchFormat ? formatMap[input.matchFormat] : undefined,
      players: `${input.filledSlots}/${input.totalSlots}`,
      hostName: input.host?.fullName,
      hostAvatar: input.host?.avatarUrl ?? null,
      image: input.venuePhotos?.[0]?.photoUrl || "",
      status: input.status,
      date: formatDateWithTodayLabel(input.matchDate),
      venue: input.field?.venue?.address ?? input.field?.fieldName,
      time: formatTimeRange(input.startTime, input.endTime),
      isPrivate: false,
    };
  }

  return {
    id: String(input.roomId ?? ""),
    title: input.roomName,
    format: input.matchFormat ? formatMap[input.matchFormat] : undefined,
    players: `${input.filledSlots}/${input.totalSlots}`,
    hostName: input.hostName,
    hostAvatar: input.hostAvatar ?? null,
    image: input.venuePhotos?.[0]?.photoUrl || "",
    status: input.status,
    date: formatDateWithTodayLabel(input.matchDate),
    venue: input.venueAddress || input.venueName,
    time: formatTimeRange(input.startTime, input.endTime),
    isPrivate: input.isPrivate ?? input.visibility === "Private",
  };
}

