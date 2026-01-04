// export interface Venue {
//   id: string;
//   name: string;
//   address: string;
//   city: string;
//   district: string;
//   price: number;
//   rating: number;
//   totalReviews: number;
//   image: string;
//   latitude?: number;
//   longitude?: number;
//   facilities: string[];
//   openingHours: {
//     open: string;
//     close: string;
//   };
//   availableFormats: ('5vs5' | '7vs7' | '11vs11')[];
//   description?: string;
//   contactPhone?: string;
// }
export interface Venue {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  rating: number;
  totalReviews: number;
}
export interface VenueFilters {
  city?: string;
  district?: string;
  format?: '5vs5' | '7vs7' | '11vs11';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
}

export interface VenueReview {
  id: string;
  venueId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface VenueBooking {
  id: string;
  venueId: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  format: '5vs5' | '7vs7' | '11vs11';
  status: 'pending' | 'confirmed' | 'cancelled';
  totalPrice: number;
}

