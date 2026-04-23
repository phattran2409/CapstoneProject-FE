export type RoomAutoCloseRule =
  | "24h_after_creation"
  | "2h_before_kickoff"
  | "15m_grace";

export interface RoomAutoClosePolicyResult {
  deadline: Date;
  rule: RoomAutoCloseRule;
}

const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;

const parseKickoffDateTime = (matchDate: string, startTime: string): Date => {
  const kickoff = new Date(matchDate);

  if (!startTime) {
    return kickoff;
  }

  const [hh, mm] = startTime.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    return kickoff;
  }

  kickoff.setHours(hh, mm, 0, 0);
  return kickoff;
};

export const getRoomAutoClosePolicy = (
  createdAt: string,
  matchDate: string,
  startTime: string,
): RoomAutoClosePolicyResult => {
  const createdAtDate = new Date(createdAt);
  const kickoffAt = parseKickoffDateTime(matchDate, startTime);

  const createdPlus24h = new Date(createdAtDate.getTime() + 24 * MS_PER_HOUR);
  const twoHoursBeforeKickoff = new Date(kickoffAt.getTime() - 2 * MS_PER_HOUR);

  // Booking is created when less than 2 hours remain before kickoff.
  if (twoHoursBeforeKickoff.getTime() <= createdAtDate.getTime()) {
    return {
      deadline: new Date(createdAtDate.getTime() + 15 * MS_PER_MINUTE),
      rule: "15m_grace",
    };
  }

  if (createdPlus24h.getTime() <= twoHoursBeforeKickoff.getTime()) {
    return {
      deadline: createdPlus24h,
      rule: "24h_after_creation",
    };
  }

  return {
    deadline: twoHoursBeforeKickoff,
    rule: "2h_before_kickoff",
  };
};

