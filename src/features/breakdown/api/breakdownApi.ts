import { apiClient } from "@/shared/api";
import { API_CONFIG } from "@/shared/constants/api";
import type { EloBreakdownRecord } from "../types/breakdown.types";

export interface GetEloBreakdownParams {
  matchId?: string;
}

/** Shape returned by the BE: { isSuccess: true, data: EloBreakdownRecord[] } */
interface EloBreakdownApiResponse {
  isSuccess: boolean;
  data: EloBreakdownRecord[];
}

export const getEloBreakdown = async (
  params?: GetEloBreakdownParams,
): Promise<EloBreakdownRecord[]> => {
  const matchId = params?.matchId;
  // The axios interceptor already unwraps axios response → returns response.data
  // So `envelope` here is { isSuccess, data: EloBreakdownRecord[] }
  const envelope = await apiClient.get<EloBreakdownApiResponse>(
    API_CONFIG.ENDPOINTS.PLAYER_PROFILES.ELO_BREAKDOWN,
    {
      params: matchId ? { matchId } : undefined,
    },
  ) as unknown as EloBreakdownApiResponse;
  const list = envelope?.data;
  return Array.isArray(list) ? list : [];
};
