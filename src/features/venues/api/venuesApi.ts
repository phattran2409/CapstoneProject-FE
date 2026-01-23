import { apiClient } from '@/shared/api/client';
import { Venue, VenueFilters, VenueReview, VenueBooking, PaginatedVenueResponse } from '../types/venue.types';
import { API_CONFIG } from '@/shared/constants/api';


// Get all venues with optional filters
export const getVenues = async (filters?: VenueFilters): Promise<PaginatedVenueResponse> => {
try { 
  const params = new URLSearchParams();

  if(filters?.page) params.append('page', filters.page.toString());
  if(filters?.pageSize) params.append('limit', filters.pageSize.toString());
  // if (filters?.city) params.append('city', filters.city);
  // if (filters?.district) params.append('district', filters.district);
  // if (filters?.format) params.append('availableFormats_like', filters.format);
  // if (filters?.minPrice) params.append('price_gte', filters.minPrice.toString());
  // if (filters?.maxPrice) params.append('price_lte', filters.maxPrice.toString());
  // if (filters?.minRating) params.append('rating_gte', filters.minRating.toString());

  // const response = await apiClient.get<Venue[]>(`/venues?${params.toString()}`);
  const response = await apiClient.get<PaginatedVenueResponse>(API_CONFIG.ENDPOINTS.VENUES.LIST, { params: filters });
  if (response.status === 200 || response.data.isSuccess == true) {
    return response.data as PaginatedVenueResponse;
  }
  throw new Error('Failed to fetch venues');
  }catch (error) {    
    console.error('Error fetching venues:', error);
    throw error;
  }
};

// Get single venue by ID
export const getVenueById = async (id: string): Promise<Venue> => {
  const response = await apiClient.get<Venue>(`/venues/${id}`);
  // Interceptor returns response.data, so response is already the data
  return response as unknown as Venue;
};

// Get venue reviews
export const getVenueReviews = async (venueId: string): Promise<VenueReview[]> => {
  const response = await apiClient.get<VenueReview[]>(`/reviews?venueId=${venueId}`);
  // Interceptor returns response.data, so response is already the data
  return response as unknown as VenueReview[];
};

// Create venue review
export const createVenueReview = async (
  review: Omit<VenueReview, 'id' | 'createdAt'>
): Promise<VenueReview> => {
  const response = await apiClient.post<VenueReview>('/reviews', {
    ...review,
    createdAt: new Date().toISOString(),
  });
  // Interceptor returns response.data, so response is already the data
  return response as unknown as VenueReview;
};

// Get my bookings
export const getMyBookings = async (): Promise<VenueBooking[]> => {
  const response = await apiClient.get<VenueBooking[]>('/bookings?_sort=date&_order=desc');
  // Interceptor returns response.data, so response is already the data
  return response as unknown as VenueBooking[];
};

// Create venue booking
export const createVenueBooking = async (
  booking: Omit<VenueBooking, 'id' | 'status'>
): Promise<VenueBooking> => {
  const response = await apiClient.post<VenueBooking>('/bookings', {
    ...booking,
    status: 'pending',
  });
  // Interceptor returns response.data, so response is already the data
  return response as unknown as VenueBooking;
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  await apiClient.patch(`/bookings/${bookingId}`, { status: 'cancelled' });
};

