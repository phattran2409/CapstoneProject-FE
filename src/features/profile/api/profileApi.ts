import { apiClient } from "@/shared/api/client";
import {
  User,
  UpdateProfileData,
  UserProfileResponse,
  AchievementsData,
  AchievementItem,
} from "../types/profile.types";
import { ApiResponse } from "@/shared/api";
import { API_CONFIG } from "@/shared/constants/api";
import { DepositResponse } from "@/features/wallet/types/wallet.types";

export interface RadarAssessment {
  type: string;
  title: string;
  description: string;
  icon: string;
  highlightAxis: string;
}

export interface MyRadarChartData {
  form: number;
  winRate: number;
  communityScore: number;
  trust: number;
  contribution: number;
  assessments: RadarAssessment[];
  summary: string;
  updatedAt: string;
}

export type { EloBreakdownRecord } from "@/features/breakdown/types/breakdown.types";
export { getEloBreakdown as getMyEloBreakdown } from "@/features/breakdown/api/breakdownApi";

// Get user profile by ID
export const getUserProfile = async (userId: string): Promise<User> => {
  try {
    const url = API_CONFIG.ENDPOINTS.USERS.DETAIL.replace(':id', userId);
    const response = await apiClient.get<User>(url);
    console.log("response :", response.data);

    if (!response.data) {
      throw new Error("Invalid response: User profile data is missing");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

interface AchievementsApiResponse {
  isSuccess: boolean;
  data?: {
    achievements?: Array<Record<string, unknown>>;
    totalAchievements?: number;
    unlockedCount?: number;
  };
}

/** Chuẩn hóa 1 dòng achievement theo response backend hiện tại */
function mapAchievementRow(row: Record<string, unknown>): AchievementItem {
  return {
    achievementId: String(row.achievementId ?? ""),
    name: String(row.name ?? ""),
    description: row.description == null ? "" : String(row.description),
    badgeIconUrl: row.badgeIconUrl == null ? "" : String(row.badgeIconUrl),
    criteriaType: String(row.criteriaType ?? ""),
    targetValue: Number(row.targetValue ?? 0),
    currentProgress: Number(row.currentProgress ?? 0),
    progressPercent: Number(row.progressPercent ?? 0),
    status: String(row.status ?? ""),
    isUnlocked: Boolean(row.isUnlocked),
    earnedAt: row.earnedAt == null ? null : String(row.earnedAt),
  };
}

export const getAchievements = async (): Promise<AchievementsData> => {
  try {
    const response = (await apiClient.get(
      API_CONFIG.ENDPOINTS.ACHIEVEMENTS.ME,
    )) as AchievementsApiResponse;

    if (!response?.isSuccess || !response.data) {
      throw new Error("Invalid response: User achievements data is missing");
    }

    const rawList = response.data.achievements ?? [];
    const achievements = rawList.map(mapAchievementRow);

    const totalAchievements = Number(
      response.data.totalAchievements ?? achievements.length,
    );
    const unlockedCount = Number(
      response.data.unlockedCount ??
        achievements.filter((a) => a.isUnlocked).length,
    );

    return { achievements, totalAchievements, unlockedCount };
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    throw error;
  }
};

// Update my profile
export const updateMyProfile = async (
  userId: string,
  data: UpdateProfileData,
): Promise<User> => {
  const cleanedData = Object.entries(data).reduce((acc, [key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      acc[key as keyof UpdateProfileData] = value;
    }
    return acc;
  }, {} as Partial<UpdateProfileData>);

  console.log("📤 Sending profile update:", cleanedData);

  const url = API_CONFIG.ENDPOINTS.USERS.DETAIL.replace(':id', userId);
  const response = await apiClient.put<User>(url, cleanedData);
  return response.data;
};

// Update avatar
export const updateAvatar = async (
  file: File | { uri: string; type: string; name: string },
): Promise<ApiResponse<{ avatarUrl: string }>> => {
  const formData = new FormData();
  formData.append("file", file as any);
  const response = await apiClient.post(API_CONFIG.ENDPOINTS.USERS.AVATAR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  const apiResponse = response as unknown as ApiResponse<{ avatarUrl: string }>;
  if (apiResponse.isSuccess) {
    return apiResponse;
  }
  throw new Error("Avatar update failed");
};

// Send friend request
export const sendFriendRequest = async (addresseeId: string): Promise<void> => {
  try {
    const url = API_CONFIG.ENDPOINTS.FRIENDSHIPS.REQUEST.replace(':addresseeId', addresseeId);
    await apiClient.post(url);
  } catch (error) {
    console.error("Error sending friend request:", error);
    throw error;
  }
};

// Remove Friend
export const removeFriend = async (friendId: string): Promise<void> => {
  try {
    const url = API_CONFIG.ENDPOINTS.FRIENDSHIPS.DETAIL.replace(':userId', friendId);
    await apiClient.delete(url);
  } catch (error) {
    console.error("Error removing friend:", error);
    throw error;
  }
};

// Get match history for a user
export const getMatchHistory = async (userId?: string): Promise<unknown[]> => {
  const id = userId || "me";
  const url = API_CONFIG.ENDPOINTS.USERS.MATCH_HISTORY.replace(':id', id);
  const response = await apiClient.get(url);
  return (response as { data?: unknown[] })?.data ?? [];
};

export const getMyRadarChart = async (): Promise<MyRadarChartData> => {
  // The axios interceptor returns response.data, which is { isSuccess, data: MyRadarChartData }
  const envelope = await apiClient.get<{ isSuccess: boolean; data: MyRadarChartData }>(
    API_CONFIG.ENDPOINTS.PLAYER_PROFILES.RADAR_CHART,
  ) as unknown as { isSuccess: boolean; data: MyRadarChartData };
  if (!envelope?.data) throw new Error("Invalid radar chart response");
  return envelope.data;
};

export const getUserRadarChart = async (userId: string): Promise<MyRadarChartData> => {
  const url = API_CONFIG.ENDPOINTS.PLAYER_PROFILES.USER_RADAR_CHART.replace(':userId', userId);
  const response = await apiClient.get<MyRadarChartData>(url);
  return response.data;
};
// Update notification settings
export const updateNotificationSettings = async (
  matchRoom: boolean,
  friendship: boolean,
  post: boolean,
  chat: boolean,
): Promise<ApiResponse> => {
  try {
    const response = await apiClient.put(API_CONFIG.ENDPOINTS.NOTIFICATION_PREFERENCES.BASE, {
      matchRoom,
      friendship,
      post,
      chat,
    });
    console.log("response :", response);
    return response.data;
  } catch (error) {
    console.error("Error updating notification settings:", error);
    throw error;
  }
};

export interface NotificationPreferences {
  matchRoom: boolean;
  friendship: boolean;
  post: boolean;
  chat: boolean;
}

export interface BookingItem {
  bookingId: string;
  roomId: string;
  fieldId: string;
  fieldName: string;
  venueName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface BookingListResponse {
  bookings: BookingItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getNotificationSettings =
  async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PREFERENCES.BASE,
    );
    if (!response.data) throw new Error("No notification preferences data");
    console.log("response :", response.data);
    return response.data;
  };

export const getMyBookings = async (
  date: string,
  page = 1,
  pageSize = 10,
): Promise<BookingListResponse> => {
  const envelope = await apiClient.get<{
    isSuccess: boolean;
    data: BookingListResponse;
  }>(API_CONFIG.ENDPOINTS.BOOKINGS.LIST, {
    params: {
      date,
      page,
      pageSize,
    },
  }) as unknown as {
    isSuccess: boolean;
    data: BookingListResponse;
  };

  if (!envelope?.isSuccess || !envelope.data) {
    throw new Error("Invalid response: Booking data is missing");
  }

  return envelope.data;
};

export const purchasePremiumDirect = async (): Promise<DepositResponse> => {
  const data = await apiClient.post(API_CONFIG.ENDPOINTS.PREMIUM.PURCHASE);
  const body = data as unknown as ApiResponse<DepositResponse>;
  if (body?.isSuccess) return body.data as DepositResponse;
  return data as unknown as DepositResponse;
};

export const purchasePremiumByWallet = async (): Promise<unknown> => {
  const data = await apiClient.post(API_CONFIG.ENDPOINTS.PREMIUM.PURCHASE_WALLET);
  return data;
};
