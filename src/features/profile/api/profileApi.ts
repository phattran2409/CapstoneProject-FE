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

export interface EloBreakdownRecord {
  matchId: string;
  eloBefore: number;
  eloAfter: number;
  eloChange: number;
  k1MatchResultComponent: number;
  k2FeedbackSentimentComponent: number;
  k3WinRateComponent: number;
  k4ContributionComponent: number;
  k5TrustComponent: number;
  calculationDetails: string;
  createdAt: string;
}

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

function unwrapAchievementsPayload(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const nested = body.data ?? body.Data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return body;
}

function pickAchievementsArray(
  o: Record<string, unknown> | undefined,
): unknown[] | null {
  if (!o) return null;
  const a = o.achievements ?? o.Achievements ?? o.items ?? o.Items;
  return Array.isArray(a) ? a : null;
}

/** Chuẩn hóa 1 dòng achievement (camelCase / PascalCase từ .NET) */
function mapAchievementRow(row: Record<string, unknown>): AchievementItem {
  return {
    achievementId: String(
      row.achievementId ??
        row.AchievementId ??
        row.id ??
        row.Id ??
        "",
    ),
    name: String(row.name ?? row.Name ?? ""),
    description: String(row.description ?? row.Description ?? ""),
    badgeIconUrl: String(row.badgeIconUrl ?? row.BadgeIconUrl ?? ""),
    criteriaType: String(row.criteriaType ?? row.CriteriaType ?? ""),
    criteriaValue: Number(row.criteriaValue ?? row.CriteriaValue ?? 0),
    isUnlocked: Boolean(row.isUnlocked ?? row.IsUnlocked),
    earnedAt: (row.earnedAt ?? row.EarnedAt ?? null) as string | null,
  };
}

export const getAchievements = async (): Promise<AchievementsData> => {
  try {
    const body = (await apiClient.get(
      API_CONFIG.ENDPOINTS.ACHIEVEMENTS.ME,
    )) as Record<string, unknown>;

    const inner = unwrapAchievementsPayload(body);
    let rawList = pickAchievementsArray(inner);
    if (!rawList) rawList = pickAchievementsArray(body);
    if (!Array.isArray(rawList)) {
      throw new Error("Invalid response: User achievements data is missing");
    }

    const achievements = rawList.map((row) =>
      mapAchievementRow(row as Record<string, unknown>),
    );

    const totalAchievements = Number(
      inner.totalAchievements ??
        inner.TotalAchievements ??
        body.totalAchievements ??
        body.TotalAchievements ??
        achievements.length,
    );
    const unlockedCount = Number(
      inner.unlockedCount ??
        inner.UnlockedCount ??
        body.unlockedCount ??
        body.UnlockedCount ??
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
  const response = await apiClient.get<MyRadarChartData>(
    API_CONFIG.ENDPOINTS.PLAYER_PROFILES.RADAR_CHART,
  );
  return response as unknown as MyRadarChartData;
};

export const getMyEloBreakdown = async (
  matchId?: string,
): Promise<EloBreakdownRecord[]> => {
  const response = await apiClient.get<EloBreakdownRecord[]>(
    API_CONFIG.ENDPOINTS.PLAYER_PROFILES.ELO_BREAKDOWN,
    {
      params: matchId ? { matchId } : undefined,
    },
  );
  return response as unknown as EloBreakdownRecord[];
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

export const getNotificationSettings =
  async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get<NotificationPreferences>(
      API_CONFIG.ENDPOINTS.NOTIFICATION_PREFERENCES.BASE,
    );
    if (!response.data) throw new Error("No notification preferences data");
    console.log("response :", response.data);
    return response.data;
  };
