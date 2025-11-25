# Assets Folder

## 📁 Structure

### images/
Đặt tất cả hình ảnh của app vào đây:
- Logo
- Icons
- Illustrations
- Backgrounds
- etc.

**Supported formats**: PNG, JPG, SVG, GIF, WEBP

### fonts/
Đặt custom fonts vào đây:
- Inter (recommended)
- Roboto (recommended)
- Hoặc fonts khác

**Supported formats**: TTF, OTF

## 🎯 Usage

### Images
```typescript
import { Image } from 'react-native';

<Image 
  source={require('./assets/images/logo.png')} 
  style={{ width: 100, height: 100 }}
/>
```

### Fonts
```typescript
import * as Font from 'expo-font';

await Font.loadAsync({
  'Inter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
  'Inter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
});
```

## 📦 Recommended Fonts

### Inter
Download: https://fonts.google.com/specimen/Inter

Files needed:
- Inter-Regular.ttf
- Inter-Medium.ttf
- Inter-SemiBold.ttf
- Inter-Bold.ttf

### Roboto
Download: https://fonts.google.com/specimen/Roboto

Files needed:
- Roboto-Regular.ttf
- Roboto-Medium.ttf
- Roboto-Bold.ttf

## 💡 Tips

1. **Optimize images**: Sử dụng tinypng.com để compress
2. **Use @2x, @3x**: Cho different screen densities
3. **SVG for icons**: Scalable và nhỏ gọn
4. **Web fonts**: Có thể load từ Google Fonts

