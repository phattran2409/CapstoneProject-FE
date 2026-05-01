# Kickify (Capstone SP26SE007) — Mobile App (React Native + Expo)

Kickify là **ứng dụng mobile** thuộc đề tài Capstone: **AI‑Driven Football Team Formation and Player Evaluation System** (SP26SE007).

- **Repo này**: Frontend Mobile (Expo React Native, TypeScript)

## Mục tiêu & phạm vi (tóm tắt)

Ứng dụng hỗ trợ người chơi/host tổ chức các trận bóng theo mô hình “room”, kết nối bạn bè, chat realtime, theo dõi Elo và thực hiện các luồng đánh giá sau trận.

Các module chính trong app (theo `src/features/`):
- **Auth**: Đăng ký/đăng nhập (Email/Password + Google), OTP, đổi mật khẩu
- **Rooms**: Tạo phòng, xem thông tin phòng, lineup/formation, invite bạn bè, check‑in, trạng thái room
- **Chat**: Chat danh sách/1-1/room chat
- **Feedback**: Rating sau trận, rating sân, kết quả match & hoàn tất feedback
- **Venues**: Chọn sân, chi tiết sân (dành cho luồng đặt sân/hiển thị sân gần bạn)
- **Wallet/Payment**: Ví, rút tiền, màn hình payment success
- **Post/Social**: Tạo post, xem chi tiết post, comment/reply/like
- **Notifications**: Nhận & xem thông báo
- **Leaderboard/Breakdown**: BXH Elo, breakdown Elo

## Tech stack

- **React Native 0.76** + **Expo 52**
- **TypeScript**
- **React Navigation**
- **@tanstack/react-query** (server state)
- **Zustand** (client state: auth/app/active-room)
- **Firebase** (Auth/App) + **Google Sign-In**
- **SignalR** (realtime)
- **i18next + expo-localization** (EN/VI)

## Project structure (thực tế trong repo)

```
src/
├── app/                # App shell (navigation, providers)
├── assets/             # Ảnh/icons/fonts theo app
├── features/           # Feature modules (auth, rooms, chat, feedback, ...)
├── screens/            # Screen entrypoints (tổng hợp & route-level)
├── shared/             # shared api/components/constants/theme/utils/i18n/...
└── store/              # global stores (Zustand) dùng chung toàn app
```

## Prerequisites

- Node.js **18+** (khuyến nghị)
- npm
- Expo CLI (được cài qua `npx expo ...` là đủ trong hầu hết trường hợp)

## Setup & Run (Development)

1) Cài dependencies

```bash
npm install
```

2) Tạo file môi trường `.env`

Repo dùng **Expo public env** (prefix `EXPO_PUBLIC_...`). Tối thiểu cần:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
EXPO_PUBLIC_GOOGLE_CLIENT_ID=...
EXPO_PUBLIC_API_BASE_URL=...
EXPO_PUBLIC_SIGNALR_CHAT_HUB_URL=...
EXPO_PUBLIC_SIGNALR_MATCH_ROOM_HUB_URL=...
```

> Lưu ý: Không commit `.env` lên git. Dù `EXPO_PUBLIC_*` là biến “public” trong Expo, vẫn nên quản lý cấu hình theo môi trường và tránh đưa credentials lên repo.

3) Start Metro

```bash
npm run start
```

4) Chạy app

```bash
# Android (dev client / native run)
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

Gợi ý:
- Nếu Metro bị lỗi cache/cổng: `npm run start:clear` hoặc `npm run reset:metro`
- Nếu kẹt port: `npm run kill:8081` / `npm run kill:3000`

## Firebase native config (Android/iOS)

Expo config (`app.json`) đang trỏ tới:
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)

Đảm bảo các file này đúng theo Firebase project của bạn trước khi build native.

## Tests

```bash
npm test
```

## Build (EAS)

Repo có `eas.json` với các profile `development`, `preview`, `production`.

```bash
npx eas-cli build -p android --profile development
```

## Build Android bằng Docker (tuỳ chọn)

Repo có sẵn Docker image để build Android trong môi trường Linux sạch.

```bash
docker compose build
docker compose run android-builder
```

Bên trong container:

```bash
npm install
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

## Notes về state management

- **React Query**: dùng cho server state (fetch/cache/invalidations)
- **Zustand**:
  - `src/features/auth/store/authStore.ts` (persist AsyncStorage)
  - `src/features/rooms/store/activeRoomStore.ts` (persist active room id)
  - `src/store/appStore.ts` (theme/language/loading)


