// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://10.0.2.2:3000/api', // JSON Server URL
  // For Android Emulator: 'http://10.0.2.2:3000/api'
  // For iOS Simulator: 'http://localhost:3000/api'
  // For Real Device: 'http://YOUR_IP:3000/api'
  
  TIMEOUT: 30000, // 30 seconds
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      LOGOUT: '/auth/logout',
      REFRESH_TOKEN: '/auth/refresh',
      SEND_OTP: '/auth/send-otp',
      VERIFY_OTP: '/auth/verify-otp',
    },
    ROOMS: {
      LIST: '/rooms',
      DETAIL: '/rooms/:id',
      FULL_INFO: '/rooms/:id/full-info',
      TEAMS: '/rooms/:id/teams',
      MESSAGES: '/rooms/:id/messages',
      CREATE: '/rooms',
    },
    VENUES: {
      LIST: '/venues',
      DETAIL: '/venues/:id',
      REVIEWS: '/venues/:id/reviews',
    },
    BOOKINGS: {
      LIST: '/bookings',
      CREATE: '/bookings',
      UPDATE: '/bookings/:id',
      DELETE: '/bookings/:id',
    },
  },
} as const;

