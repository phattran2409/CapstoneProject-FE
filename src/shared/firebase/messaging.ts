import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import Constants from 'expo-constants';

/**
 * Lấy push token (FCM token trên Android / APNS trên iOS qua Expo)
 */
export const getFcmToken = async (): Promise<string | null> => {
  try {
    // Trên máy ảo (emulator) FCM thường không có token hoặc không ổn định.
    // Nếu muốn chặn hẳn máy ảo thì bật lại đoạn dưới.
    // if (!Device.isDevice) {
    //   console.log('🔕 Must use physical device for push notifications');
    //   return null;
    // }

    // Request quyền
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('🔕 Notification permission not granted');
      return null;
    }

    // Cách 1: Lấy Expo push token (dễ, đủ dùng nếu BE chấp nhận)
    // const expoPushToken = await Notifications.getExpoPushTokenAsync({
    //   projectId: Constants.expoConfig?.extra?.eas?.projectId ?? Application.applicationId,
    // });
    // console.log('🔔 Expo push token:', expoPushToken.data);
    // return expoPushToken.data;

    // Cách 2 (nếu BE bắt buộc FCM raw token): dùng
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    console.log('🔔 Device push token:', devicePushToken.data);
    return devicePushToken.data;
  } catch (error) {
    console.error('❌ Error getting push token:', error);
    return null;
  }
};