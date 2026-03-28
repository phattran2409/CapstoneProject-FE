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
    USERS: {
      FCM_TOKEN: "/users/fcm-token",
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
      /** Cập nhật tên đội – captain */
      TEAM_NAME: "/match-rooms/:id/team-name",
      /** Cập nhật privacy (Private/Public + password) */
      PRIVACY: "/match-rooms/:id/privacy",
      /** Mẫu tạo phòng của user (GET/PUT). Đổi path nếu backend khác. */
      ME_CREATE_PRESET: "/match-rooms/me/create-preset",
      PROCESS_PAYMENT: "bookings/process-payment",
      VOTE_RESULT: "/match-rooms/:id/vote-result",
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
      BANK_INFO: "/wallets/bank-info",
      TRANSACTIONS: "/wallets/transactions",
    },
    WITHDRAWALS: {
      CREATE: "/withdrawals",
      GET_MY: "/withdrawals/my",
    },
    /** Đánh giá nhận được + phản hồi (FR-27/28). Đổi path nếu BE khác. */
    FEEDBACK: {
      RECEIVED: "/match-feedbacks/received",
      /** Đánh giá mình đã gửi + phản hồi từ người được đánh giá */
      GIVEN: "/match-feedbacks/given",
      REPLY: (feedbackId: string) => `/match-feedbacks/${feedbackId}/reply`,
    },
  },
} as const;

