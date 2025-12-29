import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { venuesKeys } from '../api/venuesKeys';
import { getMyBookings, createVenueBooking, cancelBooking } from '../api/venuesApi';
import { VenueBooking } from '../types/venue.types';

export const useMyBookings = () => {
  return useQuery({
    queryKey: venuesKeys.myBookings(),
    queryFn: getMyBookings,
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVenueBooking,
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: venuesKeys.bookings() });
    },
  });
};

export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      // Invalidate bookings list
      queryClient.invalidateQueries({ queryKey: venuesKeys.bookings() });
    },
  });
};

