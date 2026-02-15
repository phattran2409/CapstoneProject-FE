import { Linking } from 'react-native';
import type { RefObject } from 'react';
import type { NavigationContainerRef } from '@react-navigation/native';
import type { RootStackParamList } from '@/app/navigation/types';

export type NotificationData = Record<string, unknown> | undefined;

/**
 * Payload khi BE chọn điều hướng bằng navigationRef (không gửi deepLink/url).
 * Gửi đúng 2 key: "screen" (tên màn hình) + "params" (object params, có thể rỗng).
 *
 * Ví dụ C# / Dictionary:
 *   data["screen"] = "FriendRequests";   // không gửi deepLink
 *   data["params"] = "{}";               // JSON string hoặc object (tùy FCM)
 *
 * Một số screen và params tương ứng (tên screen phải khớp RootStackParamList):
 *   FriendRequests  → params: {} hoặc undefined
 *   RoomInformation → params: { "roomId": "abc-123" }
 *   Chat            → params: { "chatId": "id", "chatName": "Tên phòng" }
 *   RoomChat        → params: { "roomId": "abc-123" }
 *   PostDetail      → params: { "postId": "id" }
 *   Notifications   → params: {}
 *   PersonalPage    → params: { "userId": "user-id" }
 */
export type NotificationDataNavigationRef = {
  screen: keyof RootStackParamList;
  params?: Record<string, unknown>;
};

/**
 * Xử lý payload data khi user bấm notification. Hai cách điều hướng:
 *
 * 1. Deep link (BE gửi deepLink hoặc url):
 *    - data.deepLink = "kickify://friends/requests"
 *    - data.url = "kickify://room/abc123"
 *    → Linking.openURL() (dùng config trong linking.ts)
 *
 * 2. NavigationContainerRef (BE không gửi deepLink, gửi screen + params):
 *    - data.screen = "FriendRequests" | "RoomInformation" | ...
 *    - data.params = { roomId: "..." } | { chatId, chatName } | ...
 *    → navigationRef.navigate(screen, params)
 */
export function handleNotificationResponseData(
  data: NotificationData,
  navigationRef: RefObject<NavigationContainerRef<RootStackParamList> | null>
): void {
  if (!data) return;

  // Cách 1: Deep link – BE gửi "deepLink" (vd: kickify://friends/requests) hoặc "url"
  const deepLink = (data.deepLink ?? data.url) as string | undefined;
  if (deepLink && typeof deepLink === 'string') {
    Linking.openURL(deepLink).catch(() => {});
    return;
  }

  // Cách 2: Navigate trực tiếp bằng screen + params (BE không gửi deepLink)
  const nav = navigationRef.current;
  const screen = data.screen as keyof RootStackParamList | undefined;
  let params = data.params;
  if (typeof params === 'string') {
    try {
      params = JSON.parse(params) as Record<string, unknown>;
    } catch {
      params = undefined;
    }
  }
  const paramsObj = params as Record<string, unknown> | undefined;
  if (screen && nav?.isReady()) {
    (nav.navigate as (name: keyof RootStackParamList, params?: object) => void)(screen, paramsObj);
  }
}
