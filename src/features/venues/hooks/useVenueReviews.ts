import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getVenueReviews, createVenueReview } from '../api/venuesApi';
import { VenueReview } from '../types/venue.types';

export const useVenueReviews = (venueId: string) => {
  return useQuery({
    queryKey: venuesKeys.reviews(venueId),
    queryFn: () => getVenueReviews(venueId),
    enabled: !!venueId,
  });
};

export const useCreateVenueReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVenueReview,
    onSuccess: (newReview) => {
      // Invalidate venue reviews
      queryClient.invalidateQueries({ 
        queryKey: venuesKeys.reviews(newReview.venueId) 
      });
      
      // Also invalidate venue detail to update rating
      queryClient.invalidateQueries({ 
        queryKey: venuesKeys.detail(newReview.venueId) 
      });
    },
  });
};

