# ⚡ React Native Neon Football App

A modern, TypeScript-based React Native application built with Expo, featuring a dynamic neon green theme inspired by football aesthetics.

## 🎨 Theme Colors

- **Neon Green**: `#97FB57` - Primary action color, vibrant and energetic
- **Dark Black**: `#121212` - Deep background for dark mode
- **Medium Gray**: `#909090` - Secondary text and UI elements
- **Soft White**: `#F6F2F2` - Light background and text

## ✨ Features

- 🌗 **Dark/Light Mode**: Seamless theme switching with persistent preferences
- 📱 **Modern UI Components**: Button, Card, Modal with neon theme
- 🎯 **TypeScript**: Full type safety throughout the application
- 🧭 **React Navigation**: Stack and Tab navigation setup
- 💾 **State Management**: Zustand for lightweight, efficient state management
- 🔐 **Authentication Flow**: Login screen with auth state management
- 🎨 **Theme System**: Complete theming solution with colors, spacing, fonts
- 📦 **Clean Architecture**: Well-organized folder structure

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Modal.tsx
│   └── index.ts
├── screens/            # Main app screens
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── ProfileScreen.tsx
│   └── index.ts
├── navigation/         # Navigation setup
│   ├── StackNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── types.ts
│   └── index.ts
├── theme/             # Theme system
│   ├── types.ts
│   ├── lightTheme.ts
│   ├── darkTheme.ts
│   ├── ThemeContext.tsx
│   └── index.ts
├── store/             # State management (Zustand)
│   ├── authStore.ts
│   ├── appStore.ts
│   └── index.ts
├── services/          # API services
│   ├── api.ts
│   ├── authService.ts
│   └── index.ts
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useApi.ts
│   └── index.ts
├── utils/             # Utility functions
│   ├── validation.ts
│   ├── formatters.ts
│   ├── storage.ts
│   └── index.ts
├── constants/         # App constants
│   ├── api.ts
│   └── index.ts
└── assets/            # Images and fonts
    ├── images/
    └── fonts/
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CAPSTONE_PROJECT
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device or emulator:
```bash
# Android
npm run android

# iOS (macOS only)
npm run ios

# Web
npm run web
```

## 🎯 Key Components

### Theme System

The app features a comprehensive theme system with:
- **Colors**: Primary, secondary, background, text, status colors
- **Spacing**: Consistent spacing scale (xs, s, m, l, xl, xxl)
- **Border Radius**: Predefined radius values
- **Typography**: Font sizes and weights

Usage:
```typescript
import { useTheme } from './src/theme';

const MyComponent = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello!</Text>
    </View>
  );
};
```

### Components

#### Button
```typescript
<Button
  title="Click Me"
  onPress={handlePress}
  variant="primary" // primary | secondary | outline
  size="medium"     // small | medium | large
  loading={false}
/>
```

#### Card
```typescript
<Card style={{ marginBottom: 16 }}>
  <Text>Card content</Text>
</Card>
```

#### Modal
```typescript
<Modal
  visible={isVisible}
  onClose={() => setVisible(false)}
  title="Modal Title"
>
  <Text>Modal content</Text>
</Modal>
```

## 🔧 State Management

### Auth Store (Zustand)
```typescript
import { useAuthStore } from './src/store/authStore';

const { user, isAuthenticated, login, logout } = useAuthStore();
```

### App Store
```typescript
import { useAppStore } from './src/store/appStore';

const { theme, language, setTheme, setLanguage } = useAppStore();
```

## 🌐 API Integration

The app includes a configured Axios instance with interceptors:

```typescript
import { api } from './src/services';

// Make API calls
const response = await api.get('/endpoint');
```

## 🎨 Design Philosophy

This app follows a **sports-themed, energetic design** with:
- Bold neon green accents for primary actions
- High contrast for readability
- Smooth transitions between dark and light modes
- Modern, minimalist UI components
- Athletic, dynamic feel

## 📱 Screens

1. **Login Screen**: Clean authentication interface
2. **Home Screen**: Main dashboard with cards and navigation
3. **Profile Screen**: User profile with theme toggle and settings

## 🛠️ Tech Stack

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation library
- **Zustand**: State management
- **Axios**: HTTP client
- **AsyncStorage**: Local data persistence

## 🔐 Authentication Flow

The app includes a basic authentication flow:
1. User lands on Login screen
2. After login, navigates to main tabs
3. Auth state persists with AsyncStorage
4. Logout returns to Login screen

## 📝 TypeScript Configuration

The project uses strict TypeScript settings with path aliases:
- `@/*` → `src/*`
- `@components/*` → `src/components/*`
- `@screens/*` → `src/screens/*`
- `@theme/*` → `src/theme/*`
- And more...

## 🎯 Best Practices

- **Component Structure**: Functional components with TypeScript interfaces
- **Styling**: Theme-based styling with useTheme hook
- **State**: Centralized state management with Zustand
- **Navigation**: Type-safe navigation with TypeScript
- **Code Organization**: Feature-based folder structure

## 🚧 Future Enhancements

- [ ] Add custom fonts (Inter/Roboto)
- [ ] Implement Firebase integration
- [ ] Add more screens and features
- [ ] Implement real API integration
- [ ] Add animations and transitions
- [ ] Add unit and integration tests

## 📄 License

MIT License

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ⚡ and 💚 by the development team.

