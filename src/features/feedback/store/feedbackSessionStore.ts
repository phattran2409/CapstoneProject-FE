import { create } from 'zustand';
import { storage } from '@/shared/utils/storage';

const STORAGE_KEY = 'feedback_session';

// ==================== Types ====================

export type FeedbackStep =
  | 'intro'
  | 'matchResult'
  | 'playerRating'
  | 'fieldRating'
  | 'complete';

export type MatchResult = 'TeamAWin' | 'TeamBWin' | 'Draw';

export interface FeedbackPlayer {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  position: string;
  teamAssignment: 'A' | 'B';
}

export interface PlayerRating {
  userId: string;
  rating: number;
  comment: string;
}

export interface FeedbackVenueInfo {
  /** Venue để gọi API đánh giá + fetch chi tiết ảnh / tọa độ (optional nếu session cũ trong storage) */
  venueId?: string;
  fieldId: string;
  fieldName: string;
  venueName: string;
  address: string;
  /** Ảnh từ room detail khi bắt đầu phiên (fallback khi chưa có GET venue) */
  photoUrls?: string[];
}

/** Dữ liệu phiên đánh giá – được persist vào AsyncStorage */
export interface FeedbackSession {
  roomId: string;
  /** Tên 2 đội */
  teamAName: string;
  teamBName: string;
  /** Thông tin sân */
  venue: FeedbackVenueInfo;
  /** Ngày giờ trận */
  matchDate: string;
  startTime: string;
  /** Đội của user hiện tại (A hoặc B) */
  myTeam: 'A' | 'B';
  /** Danh sách đồng đội cùng đội cần đánh giá (không bao gồm bản thân) */
  teammates: FeedbackPlayer[];
  /** Bước hiện tại user đang ở */
  currentStep: FeedbackStep;
  /** Kết quả trận đã chọn */
  matchResult: MatchResult | null;
  /** Ratings đã làm – key là userId */
  playerRatings: Record<string, PlayerRating>;
  /** Index của người chơi hiện tại trong danh sách teammates */
  currentPlayerIndex: number;
  /** Đánh giá sân */
  fieldRating: number;
  fieldComment: string;
}

// ==================== Store Interface ====================

interface FeedbackSessionState {
  session: FeedbackSession | null;
  isLoaded: boolean;

  /** Khởi động phiên mới – gọi khi bắt đầu feedback flow */
  startSession: (session: Omit<FeedbackSession,
    'currentStep' | 'matchResult' | 'playerRatings' | 'currentPlayerIndex' | 'fieldRating' | 'fieldComment'
  >) => Promise<void>;

  /** Cập nhật bước hiện tại */
  setStep: (step: FeedbackStep) => Promise<void>;

  /** Lưu kết quả trận đấu */
  setMatchResult: (result: MatchResult) => Promise<void>;

  /** Lưu rating của một người chơi */
  savePlayerRating: (userId: string, rating: number, comment: string) => Promise<void>;

  /** Chuyển sang cầu thủ tiếp theo */
  advancePlayer: () => Promise<void>;

  /** Lưu rating sân */
  setFieldRating: (rating: number, comment: string) => Promise<void>;

  /** Xoá phiên sau khi submit xong */
  clearSession: () => Promise<void>;

  /** Load phiên từ AsyncStorage khi app khởi động */
  loadSession: () => Promise<void>;
}

// ==================== Helpers ====================

const persist = async (session: FeedbackSession | null) => {
  if (session) {
    await storage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    await storage.removeItem(STORAGE_KEY);
  }
};

// ==================== Store ====================

export const useFeedbackSessionStore = create<FeedbackSessionState>((set, get) => ({
  session: null,
  isLoaded: false,

  startSession: async (init) => {
    const session: FeedbackSession = {
      ...init,
      currentStep: 'intro',
      matchResult: null,
      playerRatings: {},
      currentPlayerIndex: 0,
      fieldRating: 0,
      fieldComment: '',
    };
    set({ session });
    await persist(session);
  },

  setStep: async (step) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, currentStep: step };
    set({ session: updated });
    await persist(updated);
  },

  setMatchResult: async (result) => {
    const { session } = get();
    if (!session) return;
    const updated = { ...session, matchResult: result, currentStep: 'playerRating' as FeedbackStep };
    set({ session: updated });
    await persist(updated);
  },

  savePlayerRating: async (userId, rating, comment) => {
    const { session } = get();
    if (!session) return;
    const updated: FeedbackSession = {
      ...session,
      playerRatings: {
        ...session.playerRatings,
        [userId]: { userId, rating, comment },
      },
    };
    set({ session: updated });
    await persist(updated);
  },

  advancePlayer: async () => {
    const { session } = get();
    if (!session) return;
    const nextIndex = session.currentPlayerIndex + 1;
    const step: FeedbackStep =
      nextIndex >= session.teammates.length ? 'fieldRating' : 'playerRating';
    const updated: FeedbackSession = {
      ...session,
      currentPlayerIndex: nextIndex,
      currentStep: step,
    };
    set({ session: updated });
    await persist(updated);
  },

  setFieldRating: async (rating, comment) => {
    const { session } = get();
    if (!session) return;
    const updated: FeedbackSession = {
      ...session,
      fieldRating: rating,
      fieldComment: comment,
      currentStep: 'complete',
    };
    set({ session: updated });
    await persist(updated);
  },

  clearSession: async () => {
    set({ session: null });
    await storage.removeItem(STORAGE_KEY);
  },

  loadSession: async () => {
    try {
      const raw = await storage.getItem(STORAGE_KEY);
      if (raw) {
        const session: FeedbackSession = JSON.parse(raw);
        set({ session, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true });
    }
  },
}));
