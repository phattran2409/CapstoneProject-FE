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
      PROFILE: "/auth/profile",
    },
    USERS: {
      LIST: "/users",
      DETAIL: "/users/:id",
      AVATAR: "/users/avatar",
      FCM_TOKEN: "/users/fcm-token",
      MATCH_HISTORY: "/users/:id/match-history",
    },
    ROOMS: {
      LIST: "/match-rooms",
      RECOMMEND: "/match-rooms/recommended",
      CREATE: "/match-rooms",
      MINE: "/match-rooms/mine",
      PLAYER_HISTORY: "/match-rooms/player/:userId",
      JOIN: "/match-rooms/:id/join",
      LEAVE: "/match-rooms/:id/leave",
      DETAIL: "/match-rooms/:id",
      FULL_INFO: "/match-rooms/:id",
      TEAMS: "/match-rooms/:id/teams",
      /** Tin nhắn phòng (GET/POST, query/body roomId) */
      CHAT_MESSAGES: "/messages",
      UPDATE_PARTICIPANT: "/match-rooms/:id/participants/me",
      /** Cập nhật thông tin phòng (tên, mô tả, luật) */
      ROOM_INFO: "/match-rooms/:id/info",
      /** Hủy phòng (host); query tùy chọn: reason */
      CANCEL: "/match-rooms/:id/cancel",
      /** Kick cầu thủ khỏi phòng */
      KICK_PARTICIPANT: "/match-rooms/:id/participants/:playerId",
      /** Cập nhật đội hình (vị trí từng thành viên) – captain */
      FORMATION: "/match-rooms/:id/formation",
      /** Cập nhật tên đội – captain */
      TEAM_NAME: "/match-rooms/:id/team-name",
      /** Cập nhật privacy (Private/Public + password) */
      PRIVACY: "/match-rooms/:id/privacy",
      /** Mẫu tạo phòng của user (GET/PUT). */
      MY_PRESET_LIST: "/match-presets/mine",
      PRESET_CREATE: "/match-presets",
      PRESET_DETAIL: "/match-presets/:id",
      PROCESS_PAYMENT: "/bookings/process-payment",
      VOTE_RESULT: "/match-rooms/:id/vote-result",
      /** Chuyển quyền host sang người chơi khác */
      TRANSFER_HOST: "/match-rooms/:id/transfer-host",
      RESPONSE_TRANSFER_HOST: "/match-rooms/:id/transfer-host/respond",
      /** Legacy resource (không phải match-rooms) */
      LEGACY_ROOM: "/rooms/:id",
    },
    VENUES: {
      LIST: "/venues",
      DETAIL: "/venues/:id",
      /** GET danh sách đánh giá sân theo ID sân */
      REVIEWS: "/venues/:id/reviews",
      /** POST tạo đánh giá sân (venueId trong body) */
      ADD_REVIEW: "/venues/reviews",
    },
    FIELDS: {
      /** GET lịch trống của sân theo ngày */
      AVAILABILITY: "/fields/:fieldId/availability",
    },
    REVIEWS: {
      LIST: "/reviews",
      CREATE: "/reviews",
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
    /** Đánh giá nhận được + phản hồi (FR-27/28). */
    FEEDBACK: {
      RECEIVED: "/playerprofiles/me/feedbacks/received",
      GIVEN: "/playerprofiles/me/feedbacks/given",
      REPLY: (feedbackId: string) => `/match-feedbacks/${feedbackId}/response`,
    },
    MATCH_FEEDBACKS: {
      CREATE: "/match-feedbacks",
    },
    PLAYER_REPORTS: {
      CREATE: "/player-reports",
    },
    NOTIFICATIONS: {
      LIST: "/notifications",
      MARK_READ: "/notifications/:id/read",
      MARK_ALL_READ: "/notifications/read-all",
    },
    NOTIFICATION_PREFERENCES: {
      BASE: "/notification-preferences",
    },
    LEADERBOARD: {
      LIST: "/playerprofiles/leaderboard",
      MY_RANK: "/playerprofiles/my-rank",
    },
    PLAYER_PROFILES: {
      RADAR_CHART: "/playerprofiles/me/radar-chart",
      ELO_BREAKDOWN: "/playerprofiles/me/elo-breakdown",
    },
    ACHIEVEMENTS: {
      ME: "/achievements/me",
    },
    FRIENDSHIPS: {
      REQUESTS: "/friendships/requests",
      FRIENDS: "/friendships/friends",
      STATUS: "/friendships/status/:userId",
      RESPOND: "/friendships/respond/:requesterId",
      REQUEST: "/friendships/request/:addresseeId",
      DETAIL: "/friendships/:userId",
    },
    POSTS: {
      LIST: "/posts",
      DETAIL: "/posts/:id",
      LIKE: "/posts/:id/like",
    },
    COMMENTS: {
      BY_POST: "/comments/:postId",
      DETAIL: "/comments/:commentId",
      REPLIES: "/comments/:commentId/replies",
      LIKE: "/comments/:commentId/like",
      REPLY_LIKE: (commentId: string, replyId: string) =>
        `/comments/${commentId}/replies/${replyId}/like`,
    },
    CONTENT_REPORTS: {
      CREATE: (contentType: string, contentId: string) =>
        `/content-reports/${contentType}/${contentId}`,
    },
    CHAT: {
      CONVERSATIONS: "/chat/conversations",
      CONVERSATION: "/chat/conversation/:userId",
      ROOM_MESSAGES: "/chat/room/:roomId/messages",
      ROOM_SEND: "/chat/room/send",
      SEND: "/chat/send",
      READ: "/chat/read/:fromUserId",
    },
  },
} as const;
