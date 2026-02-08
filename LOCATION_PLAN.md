# Kế hoạch: Lấy latitude & longitude của client

## 1. Thư viện đề xuất: `expo-location`

- Tương thích Expo (dự án đang dùng Expo 52).
- Hỗ trợ Android / iOS, xử lý quyền location.
- Có thể lấy vị trí một lần hoặc theo dõi liên tục.

## 2. Cài đặt

```bash
npx expo install expo-location
```

## 3. Cấu hình quyền

### app.json / app.config.js

- **iOS**: Thêm `NSLocationWhenInUseUsageDescription` (và nếu cần `NSLocationAlwaysAndWhenInUseUsageDescription`).
- **Android**: `expo-location` tự thêm quyền `ACCESS_COARSE_LOCATION` / `ACCESS_FINE_LOCATION`; có thể cấu hình `android.permissions` trong app config nếu cần.

Ví dụ trong `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationWhenInUsePermission": "Ứng dụng cần vị trí để tìm sân gần bạn.",
          "locationAlwaysAndWhenInUsePermission": "Ứng dụng cần vị trí để tìm sân gần bạn."
        }
      ]
    ]
  }
}
```

## 4. Luồng lấy vị trí (latitude, longitude)

1. Gọi `Location.requestForegroundPermissionsAsync()` (hoặc `requestBackgroundPermissionsAsync` nếu cần nền).
2. Nếu được cấp quyền: gọi `Location.getCurrentPositionAsync(options)`.
3. Kết quả: `position.coords.latitude`, `position.coords.longitude`.

Ví dụ:

```ts
import * as Location from 'expo-location';

async function getCurrentLatLng(): Promise<{ latitude: number; longitude: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    // Người dùng từ chối quyền
    return null;
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced, // hoặc High nếu cần chính xác hơn
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
```

## 5. Gợi ý tích hợp trong project

- **Hook**: Tạo `useCurrentLocation()` trong `src/shared/hooks/` (hoặc `features/rooms/hooks`) để:
  - Request permission lần đầu.
  - Gọi `getCurrentPositionAsync` và trả về `{ latitude, longitude }`, trạng thái loading/error.
- **Dùng khi tạo phòng / chọn venue**: Có thể gửi lat/lng lên backend để filter sân gần user, hoặc hiển thị bản đồ.
- **Lưu ý**: Trên máy ảo/simulator có thể set location mặc định; trên thiết bị thật cần bật GPS.

## 6. Tài liệu tham khảo

- [expo-location – Expo docs](https://docs.expo.dev/versions/latest/sdk/location/)
