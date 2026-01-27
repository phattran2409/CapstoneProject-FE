import { apiClient } from '@/shared/api/client';
import { Venue, VenueFilters, VenueReview, VenueBooking, PaginatedVenueResponse, FieldAvailability, FieldAvailabilityResponse } from '../types/venue.types';
import { API_CONFIG } from '@/shared/constants/api';
import axios from 'axios';


// Get all venues with optional filters
export const getVenues = async (filters?: VenueFilters): Promise<PaginatedVenueResponse> => {
  try { 
    const response = await apiClient.get<PaginatedVenueResponse>(API_CONFIG.ENDPOINTS.VENUES.LIST, { params: filters });
    // Interceptor returns response.data, so response is already the data
    return response as unknown as PaginatedVenueResponse;
  } catch (error) {    
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

// Get field availability (time slots)
export const getFieldAvailability = async (fieldId: string, date: string): Promise<FieldAvailability> => {
  try {
    const response = await axios.get<FieldAvailabilityResponse>(
      `https://api.kickify.site/api/fields/${fieldId}/availability`,
      { params: { date } }
    );
    console.log('response', response.data);
    return response.data.data as unknown as FieldAvailability;   
  } catch (error) {
    console.error('Error fetching field availability:', error);
    throw error;
  }
};

