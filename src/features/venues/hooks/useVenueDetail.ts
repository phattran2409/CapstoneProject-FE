import { useQuery } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getVenueById } from '../api/venuesApi';
import { VenueDetail, VenueDetailResponse } from '../types/venue.types';

/**
 * Hook để lấy thông tin cơ bản của venue
 */
// export const useVenueBasic = (venueId: string) => {
//   return useQuery({
//     queryKey: venuesKeys.detail(venueId),
//     queryFn: () => getVenueById(venueId),
//     enabled: !!venueId,
//     staleTime: 5 * 60 * 1000, // 5 minutes
//   });
// };

/**
 * Hook để lấy chi tiết đầy đủ của venue (bao gồm operating hours, photos, etc.)
 */
export const useVenueDetail = (venueId: string) => {
  return useQuery<VenueDetail>({
    queryKey: [...venuesKeys.detail(venueId), 'full'],
    queryFn: () => getVenueById(venueId),
    enabled: !!venueId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

