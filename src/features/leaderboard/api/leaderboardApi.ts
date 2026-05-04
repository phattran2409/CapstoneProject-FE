import {
  Leaderboard,
  LeaderboardData,
  LeaderboardResponse,
  MyRankData,
} from './../types/leaderboard.types';
import { LEADERBOARD_PAGE_SIZE } from '../constants';
import { apiClient } from '@/shared/api/client';
import { API_CONFIG } from '@/shared/constants/api';

export type GetLeaderboardParams = {
  page?: number;
  pageSize?: number;
};

/** Chuẩn hóa 1 dòng leaderboard (.NET PascalCase → camelCase) */
function mapLeaderboardRow(row: Record<string, unknown>): Leaderboard {
  const r = row as Record<string, unknown>;
  return {
    rank: Number(r.rank ?? r.Rank ?? 0),
    userId: String(r.userId ?? r.UserId ?? ""),
    fullName: String(r.fullName ?? r.FullName ?? ""),
    email: String(r.email ?? r.Email ?? ""),
    avatarUrl: (r.avatarUrl ?? r.AvatarUrl ?? null) as string | null,
    currentElo: Number(r.currentElo ?? r.CurrentElo ?? 0),
    currentRank: String(r.currentRank ?? r.CurrentRank ?? ""),
    isLegend: Boolean(r.isLegend ?? r.IsLegend),
    eloChange: Number(r.eloChange ?? r.EloChange ?? 0),
    totalMatches: Number(r.totalMatches ?? r.TotalMatches ?? 0),
  };
}

// Get player leaderboard
export const getLeaderboardPlayers = async (
  params: GetLeaderboardParams = {},
): Promise<LeaderboardData> => {
  try {
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? LEADERBOARD_PAGE_SIZE;
    const body = (await apiClient.get(API_CONFIG.ENDPOINTS.LEADERBOARD.LIST, {
      params: { page, pageSize },
    })) as LeaderboardResponse & {
      Data?: { leaderboard?: Leaderboard[]; Leaderboard?: Leaderboard[] };
    };

    const nested = body.data ?? body.Data;
    const rawList =
      nested?.leaderboard ??
      (nested as { Leaderboard?: Leaderboard[] })?.Leaderboard;
    if (!Array.isArray(rawList)) {
      throw new Error("Failed to fetch leaderboard");
    }
    return {
      leaderboard: rawList.map((row) =>
        mapLeaderboardRow(row as unknown as Record<string, unknown>),
      ),
    };
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    throw error;
  }
};

/**
 * API: { "isSuccess": true, "data": { "rank": 1 } }
 * axios interceptor đã trả body → cần đọc `data.rank` (và PascalCase từ .NET nếu có).
 */
export const getMyRank = async (): Promise<MyRankData> => {
  try {
    const response = (await apiClient.get(API_CONFIG.ENDPOINTS.LEADERBOARD.MY_RANK)) as {
      isSuccess: boolean;
      data: { rank: number };
    };
    if (response.isSuccess && response.data?.rank) {
      return { rank: response.data.rank };
    }

    throw new Error("Failed to fetch my rank: invalid response");
  } catch (error) {
    console.error("Error fetching my rank:", error);
    throw error;
  }
};
