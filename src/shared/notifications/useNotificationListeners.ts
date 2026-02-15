import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { navigationRef } from '@/app/navigation';
import { setupNotificationHandler, setupAndroidNotificationChannel } from './setupNotifications';
import {
  handleNotificationResponseData,
  type NotificationData,
} from '@/shared/notifications/handleNotificationData';

/**
 * Hook: setup notification handler + Android channel, đăng ký listener
 * khi notification đến và khi user bấm vào notification.
 * Gọi 1 lần ở root (vd: AppContent).
 */
export function useNotificationListeners(): void {
  useEffect(() => {
    setupNotificationHandler();
    setupAndroidNotificationChannel();
  }, []);

  useEffect(() => {
    const receivedSub = Notifications.addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data as NotificationData;
      if (data?.type) {
        // Xử lý theo loại event (refresh, badge, ...)
        // Ví dụ: if (data.type === 'new_match') queryClient.invalidateQueries({ queryKey: ['matches'] });
      }
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as NotificationData;
      handleNotificationResponseData(data, navigationRef);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);
}
