import { useQuery } from "@tanstack/react-query";
import { getEloBreakdown } from "../api/breakdownApi";
import { breakdownKeys } from "../api/breakdownKeys";

export const useEloBreakdown = (matchId?: string, enabled = true) => {
  return useQuery({
    queryKey: breakdownKeys.eloBreakdown(matchId),
    queryFn: () => getEloBreakdown({ matchId }),
    staleTime: 15 * 1000,
    enabled,
  });
};
