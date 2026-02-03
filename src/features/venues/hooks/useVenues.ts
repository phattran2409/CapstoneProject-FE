import { useQuery } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getVenues } from '../api/venuesApi';
import { Venue, VenueFilters } from '../types/venue.types';
import { usePagination } from '@/shared/hooks/usePagination';

export const useVenues = (filters?: VenueFilters) => {
  const pagination = usePagination<Venue>({
    queryKey: venuesKeys.list(filters),
    fetchFunction: async (page, size) => {
      const result = await getVenues({
        page,
        pageSize: size,
        sportType: filters?.sportType ?? undefined,
      });
      return {
        data: result.data.venues,
        totalPages: result.data.totalPages,
        totalCount: result.data.totalCount,
      };
    },
    pageSize: filters?.pageSize || 10,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!filters,
    onError: (error) => {
      console.error('Error fetching venues:', error);
    },
  })
  return {
    venues: pagination.data,
    loading: pagination.loading,
    refreshing: pagination.refreshing,
    loadingMore: pagination.loadingMore,
    error: pagination.error,
    hasMore: pagination.hasMore,
    refresh: pagination.refresh,
    loadMore: pagination.loadMore,
    setVenues: pagination.setData,
  }
};

