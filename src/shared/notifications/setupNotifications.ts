import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Cấu hình handler mặc định cho notification (sound, badge, alert).
 * Gọi 1 lần khi app khởi động.
 */
export function setupNotificationHandler(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowAlert: true,
    }),
  });
}

/**
 * Tạo Android notification channel (bắt buộc Android 8+).
 * Gọi 1 lần khi app khởi động trên Android.
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
    sound: 'default',
    showBadge: true,
  });
}
