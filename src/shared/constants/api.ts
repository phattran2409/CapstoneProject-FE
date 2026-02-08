// API Configuration
export const API_CONFIG = {
  BASE_URL: "https://api.kickify.site/api",
  // BASE_URL :  'http://10.0.2.2:3000/api', // JSON Server URL 
  // For Android Emulator: 'http://10.0.2.2:3000/api'
  // For iOS Simulator: 'http://localhost:3000/api'
  // For Real Device: 'http://YOUR_IP:3000/api'

  TIMEOUT: 30000, // 30 seconds

  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/email/login",
      GOOGLE_LOGIN: "/auth/firebase/login",
      REGISTER: "/auth/register-player",
      LOGOUT: "/auth/logout",
      REFRESH_TOKEN: "/auth/refresh",
      VERIFY_EMAIL: "/auth/verify-mail",
      VERIFY_OTP: "/auth/verify-otp",
      FORGOT_PASSWORD: "/auth/forgot-password",
      CHANGE_PASSWORD: "/auth/change-password",
      RESEND_OTP: "/auth/resend-otp",
    },
    ROOMS: {
      LIST: "/match-rooms",
      JOIN: "/match-rooms/:id/join",
      LEAVE: "/match-rooms/:id/leave",
      DETAIL: "/match-rooms/:id",
      FULL_INFO: "/match-rooms/:id",
      TEAMS: "/match-rooms/:id/teams",
      MESSAGES: "/match-rooms/:id/messages",
      CREATE: "/match-rooms",
      UPDATE_PARTICIPANT: "/match-rooms/:id/participants/me",
      /** Cập nhật đội hình (vị trí từng thành viên) – captain */
      FORMATION: "/match-rooms/:id/formation",
      /** Cập nhật privacy (Private/Public + password) */
      PRIVACY: "/match-rooms/:id/privacy",
      PROCESS_PAYMENT: "bookings/process-payment",
      },
    VENUES: {
      LIST: "/venues",
      DETAIL: "/venues/:id",
      REVIEWS: "/venues/:id/reviews",
    },
    BOOKINGS: {
      LIST: "/bookings",
      CREATE: "/bookings",
      UPDATE: "/bookings/:id",
      DELETE: "/bookings/:id",
    },
    WALLETS: {
      BALANCE: "/wallets/balance",
      DEPOSIT: "/wallets/deposit",
    },
  },
} as const;

