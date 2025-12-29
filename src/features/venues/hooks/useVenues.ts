import { useQuery } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getVenues } from '../api/venuesApi';
import { VenueFilters } from '../types/venue.types';

export const useVenues = (filters?: VenueFilters) => {
  return useQuery({
    queryKey: venuesKeys.list(filters),
    queryFn: () => getVenues(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

