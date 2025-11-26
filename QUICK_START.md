# ⚡ Quick Start Guide

## Bắt đầu ngay trong 5 phút!

### 1️⃣ Cài đặt Dependencies

```bash
npm install
```

### 2️⃣ Chạy ứng dụng

```bash
# Khởi động Expo Dev Server
npm start

# Hoặc chạy trực tiếp trên thiết bị
npm run android  # Android
npm run ios      # iOS (chỉ trên macOS)
npm run web      # Web browser
```

### 3️⃣ Quét QR Code

- Cài đặt **Expo Go** trên điện thoại
- Quét QR code từ terminal
- App sẽ tự động load!

## 🎨 Tính năng nổi bật

### ✅ Dark/Light Mode
- Nhấn nút toggle trên Profile screen
- Theme tự động lưu lại
- Mượt mà chuyển đổi giữa 2 chế độ

### ✅ Song ngữ EN ↔ VI
- Dùng `i18next` + `expo-localization`
- App tự nhận biết ngôn ngữ thiết bị
- Có thể đổi ngay trên Profile screen

### ✅ Components có sẵn
```typescript
// Button với 3 variants
<Button title="Click" onPress={fn} variant="primary" />
<Button title="Click" onPress={fn} variant="secondary" />
<Button title="Click" onPress={fn} variant="outline" />

// Card component
<Card>
  <Text>Your content here</Text>
</Card>

// Modal
<Modal visible={show} onClose={() => setShow(false)} title="Title">
  <Text>Modal content</Text>
</Modal>
```

## 📱 Màn hình Demo

1. **Login Screen** 
   - Nhập email/password bất kỳ
   - Nhấn Login để vào app

2. **Home Screen**
   - Card hiển thị thông tin
   - Button navigate sang Profile

3. **Profile Screen**
   - Hiển thị thông tin user
   - Toggle Dark/Light mode
   - Demo Modal
   - Logout button

## 🎨 Sử dụng Theme

```typescript
import { useTheme } from './src/theme';

const MyScreen = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m 
    }}>
      <Text style={{ 
        color: theme.colors.text,
        fontSize: theme.fontSizes.l 
      }}>
        Hello World!
      </Text>
    </View>
  );
};
```

## 🔧 Cấu trúc Folder

```
src/
├── components/     → Button, Card, Modal
├── screens/        → Home, Login, Profile
├── navigation/     → Stack & Tab navigation
├── theme/          → Light/Dark themes
├── store/          → Zustand state management
├── services/       → API calls
├── hooks/          → Custom hooks
├── utils/          → Helper functions
└── constants/      → API config, constants
```

## 🎯 Next Steps

### Thêm màn hình mới
1. Tạo file trong `src/screens/`
2. Export từ `src/screens/index.ts`
3. Thêm vào navigation

### Thêm component mới
1. Tạo trong `src/components/`
2. Sử dụng `useTheme()` hook
3. Export từ `src/components/index.ts`

### Thêm API service
1. Tạo service trong `src/services/`
2. Sử dụng instance `api` có sẵn
3. Thêm endpoint vào `constants/api.ts`

### Thêm state mới
1. Tạo store trong `src/store/`
2. Sử dụng Zustand
3. Export từ `src/store/index.ts`

## 📚 Tài liệu

- [README.md](./README.md) - Tổng quan project
- [THEME_GUIDE.md](./THEME_GUIDE.md) - Hướng dẫn theme chi tiết
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Zustand](https://github.com/pmndrs/zustand)

## 🎨 Màu sắc chính

| Màu | Hex | Dùng cho |
|-----|-----|----------|
| Neon Green | `#97FB57` | Primary buttons, accents |
| Dark Black | `#121212` | Dark backgrounds, text |
| Medium Gray | `#909090` | Secondary text |
| Soft White | `#F6F2F2` | Light backgrounds |

## 💡 Tips

1. **TypeScript**: Đã được cấu hình đầy đủ với strict mode
2. **Path Aliases**: Sử dụng `@components/`, `@screens/`, etc.
3. **Theme**: Tất cả components đều dùng theme system
4. **Navigation**: Type-safe với TypeScript
5. **State**: Zustand rất nhẹ và dễ dùng

## 🐛 Troubleshooting

### Lỗi Metro bundler
```bash
# Clear cache và restart
npx expo start -c
```

### Lỗi TypeScript
```bash
# Kiểm tra tsconfig.json
# Restart VS Code/Editor
```

### Module not found
```bash
# Xóa node_modules và cài lại
rm -rf node_modules
npm install
```

## 🚀 Ready to Build!

Bây giờ bạn đã sẵn sàng để xây dựng app tuyệt vời với theme neon football!

Có câu hỏi? Xem [README.md](./README.md) hoặc [THEME_GUIDE.md](./THEME_GUIDE.md)

---

Happy Coding! ⚡💚

