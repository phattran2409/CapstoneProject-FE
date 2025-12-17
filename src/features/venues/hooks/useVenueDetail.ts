import { useQuery } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getVenueById } from '../api/venuesApi';

export const useVenueDetail = (venueId: string) => {
  return useQuery({
    queryKey: venuesKeys.detail(venueId),
    queryFn: () => getVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

