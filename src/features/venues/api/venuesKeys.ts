import { VenueFilters } from '../types/venue.types';

export const venuesKeys = {
  all: ['venues'] as const,
  lists: () => [...venuesKeys.all, 'list'] as const,
  list: (filters?: VenueFilters) => [...venuesKeys.lists(), { filters }] as const,
  details: () => [...venuesKeys.all, 'detail'] as const,
  detail: (venueId: string) => [...venuesKeys.details(), venueId] as const,
  reviews: (venueId: string) => [...venuesKeys.all, 'reviews', venueId] as const,
  bookings: () => [...venuesKeys.all, 'bookings'] as const,
  myBookings: () => [...venuesKeys.bookings(), 'my'] as const,
};

