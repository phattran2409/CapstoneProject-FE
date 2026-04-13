import { apiClient } from "@/shared/api";
import { API_CONFIG } from "@/shared/constants/api";
import type { EloBreakdownRecord } from "../types/breakdown.types";

export interface GetEloBreakdownParams {
  matchId?: string;
}

export const getEloBreakdown = async (
  params?: GetEloBreakdownParams,
): Promise<EloBreakdownRecord[]> => {
  const matchId = params?.matchId;
  const response = await apiClient.get<EloBreakdownRecord[]>(
    API_CONFIG.ENDPOINTS.PLAYER_PROFILES.ELO_BREAKDOWN,
    {
      params: matchId ? { matchId } : undefined,
    },
  );
  return Array.isArray(response) ? response : [];
};
