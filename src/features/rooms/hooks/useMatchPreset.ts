import { usePagination } from "@/shared/hooks";
import { MatchRoomFilters, RoomPresetItem } from "../types/room.types";
import { roomsApi, roomsKeys } from "../api";

export const useMatchPreset = (filters?: Pick<MatchRoomFilters, 'page' | 'pageSize'>) => {
    const pagination = usePagination<RoomPresetItem>({
        queryKey: roomsKeys.matchPresetList(),
        fetchFunction: async (page, pageSize) => {
            const result = await roomsApi.getMatchPresetList({ page, pageSize });
            return {
                data: result.data?.items ?? [],
                totalPages: result.data?.totalPages ?? 1,
                totalCount: result.data?.totalCount ?? 0,
            };
        },
        pageSize: filters?.pageSize || 10,
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: true,
        onError: (error) => {
            console.error('Error fetching match presets:', error);
        },
    });
    return {
        matchPresets: pagination.data,
        loading: pagination.loading,
        refreshing: pagination.refreshing,
        loadingMore: pagination.loadingMore,
        error: pagination.error,
        hasMore: pagination.hasMore,
        page: pagination.page,
        totalPages: pagination.totalPages,
        refresh: pagination.refresh,
        loadMore: pagination.loadMore,
    };
};