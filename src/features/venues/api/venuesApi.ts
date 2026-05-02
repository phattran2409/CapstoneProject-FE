import { apiClient } from '@/shared/api/client';
import { Venue, VenueDetail, VenueDetailResponse, VenueFilters, VenueReview, VenueBooking, PaginatedVenueResponse, FieldAvailability, FieldAvailabilityResponse } from '../types/venue.types';
import { API_CONFIG } from '@/shared/constants/api';


// Get all venues with optional filters
export const getVenues = async (filters?: VenueFilters): Promise<PaginatedVenueResponse> => {
  try { 
    const response = await apiClient.get<PaginatedVenueResponse>(API_CONFIG.ENDPOINTS.VENUES.LIST, { params: filters });
    return response as unknown as PaginatedVenueResponse;
  } catch (error) {    
    throw error;
  }
};

// Get single venue by ID
export const getVenueById = async (id: string): Promise<VenueDetail> => {
  try {
    const url = API_CONFIG.ENDPOINTS.VENUES.DETAIL.replace(':id', id);
    const response = await apiClient.get<VenueDetailResponse>(url);
    return response.data as unknown as VenueDetail;
  
  } catch (error) {
    throw error;
  }
};

// Get venue reviews
export const getVenueReviews = async (venueId: string): Promise<VenueReview[]> => {
  const response = await apiClient.get<VenueReview[]>(API_CONFIG.ENDPOINTS.REVIEWS.LIST, {
    params: { venueId },
  });
  return response as unknown as VenueReview[];
};

// Create venue review
export const createVenueReview = async (
  review: Omit<VenueReview, 'id' | 'createdAt'>
): Promise<VenueReview> => {
  const response = await apiClient.post<VenueReview>(API_CONFIG.ENDPOINTS.REVIEWS.CREATE, {
    ...review,
    createdAt: new Date().toISOString(),
  });
  return response as unknown as VenueReview;
};

// Get my bookings
export const getMyBookings = async (): Promise<VenueBooking[]> => {
  const response = await apiClient.get<VenueBooking[]>(API_CONFIG.ENDPOINTS.BOOKINGS.LIST, {
    params: { _sort: 'date', _order: 'desc' },
  });
  return response as unknown as VenueBooking[];
};

// Create venue booking
export const createVenueBooking = async (
  booking: Omit<VenueBooking, 'id' | 'status'>
): Promise<VenueBooking> => {
  const response = await apiClient.post<VenueBooking>(API_CONFIG.ENDPOINTS.BOOKINGS.CREATE, {
    ...booking,
    status: 'pending',
  });
  return response as unknown as VenueBooking;
};

// Cancel booking
export const cancelBooking = async (bookingId: string): Promise<void> => {
  const url = API_CONFIG.ENDPOINTS.BOOKINGS.UPDATE.replace(':id', bookingId);
  await apiClient.patch(url, { status: 'cancelled' });
};

// Get field availability (time slots)
export const getFieldAvailability = async (fieldId: string, date: string): Promise<FieldAvailability> => {
  try {
    const url = API_CONFIG.ENDPOINTS.FIELDS.AVAILABILITY.replace(':fieldId', fieldId);
    const response = await apiClient.get<FieldAvailabilityResponse>(url, { params: { date } });
    console.log('response', response);
    return (response as unknown as FieldAvailabilityResponse).data as unknown as FieldAvailability;
  } catch (error) {
    console.error('Error fetching field availability:', error);
    throw error;
  }
};
