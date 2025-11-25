# 🎨 Theme Guide - Neon Football Style

## Overview
This app features a dynamic theme system inspired by neon football aesthetics - energetic, bold, and modern.

## 🌈 Color Palette

### Light Theme
- **Primary**: `#97FB57` (Neon Green) - Main action color, stands out against light backgrounds
- **Secondary**: `#121212` (Dark Black) - Contrast color for text and accents
- **Background**: `#F6F2F2` (Soft White) - Main screen background
- **Surface**: `#FFFFFF` (Pure White) - Cards and elevated surfaces
- **Text**: `#121212` (Dark Black) - Primary text color
- **Text Secondary**: `#909090` (Medium Gray) - Secondary information

### Dark Theme
- **Primary**: `#97FB57` (Neon Green) - Pops beautifully against dark
- **Secondary**: `#B8FF6F` (Light Neon) - Lighter variant for secondary actions
- **Background**: `#121212` (Dark Black) - Main dark background
- **Surface**: `#1E1E1E` (Charcoal) - Slightly lighter for depth
- **Text**: `#F6F2F2` (Soft White) - Easy to read on dark
- **Text Secondary**: `#909090` (Medium Gray) - Maintains consistency

## 📏 Spacing System

```typescript
spacing: {
  xs: 4px   // Tiny gaps, tight spacing
  s: 8px    // Small spacing, component padding
  m: 16px   // Medium spacing, default padding
  l: 24px   // Large spacing, section gaps
  xl: 32px  // Extra large, major sections
  xxl: 48px // Huge spacing, page sections
}
```

## 🔘 Border Radius

```typescript
radius: {
  s: 8px    // Small components, chips
  m: 12px   // Medium, buttons, inputs
  l: 16px   // Large, cards, modals
  xl: 24px  // Extra large, special cards
  round: 999px // Fully rounded, pills, badges
}
```

## 📝 Typography

### Font Sizes
```typescript
fontSizes: {
  xs: 12px   // Caption, tiny labels
  s: 14px    // Small text, secondary info
  m: 16px    // Body text, default
  l: 18px    // Emphasized body text
  xl: 20px   // Subheadings
  xxl: 24px  // Section titles
  title: 28px    // Page titles
  header: 32px   // Main headers
}
```

### Font Weights
```typescript
fontWeights: {
  regular: '400'   // Normal text
  medium: '500'    // Slightly emphasized
  semiBold: '600'  // Important text
  bold: '700'      // Headers, buttons
}
```

## 🎯 Usage Examples

### Using the Theme Hook

```typescript
import { useTheme } from './src/theme';

const MyComponent = () => {
  const { theme, toggleTheme, isDark } = useTheme();
  
  return (
    <View style={{ 
      backgroundColor: theme.colors.background,
      padding: theme.spacing.m,
      borderRadius: theme.radius.l 
    }}>
      <Text style={{ 
        color: theme.colors.text,
        fontSize: theme.fontSizes.l,
        fontWeight: theme.fontWeights.bold 
      }}>
        Hello Neon World!
      </Text>
      
      <Button onPress={toggleTheme}>
        Switch to {isDark ? 'Light' : 'Dark'} Mode
      </Button>
    </View>
  );
};
```

### Creating Themed Components

```typescript
import { StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from './src/theme';

const ThemedCard = ({ children }) => {
  const { theme } = useTheme();
  
  const styles = StyleSheet.create({
    card: {
      backgroundColor: theme.colors.card,
      padding: theme.spacing.m,
      borderRadius: theme.radius.l,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }
  });
  
  return <View style={styles.card}>{children}</View>;
};
```

## 🎨 Design Principles

### 1. **High Energy**
- Neon green (`#97FB57`) is the hero color
- Use it for primary actions, important CTAs, success states
- Creates excitement and draws attention

### 2. **Strong Contrast**
- Dark black and soft white provide clear readability
- High contrast ratios meet accessibility standards
- Text is always legible on any background

### 3. **Athletic Feel**
- Bold typography for headers and buttons
- Clean lines and modern shapes
- Fast, responsive interactions

### 4. **Consistent Spacing**
- Use the spacing scale for all margins and padding
- Creates visual rhythm and harmony
- Makes UI feel organized and professional

### 5. **Smooth Transitions**
- Theme switching is instant and persistent
- Colors adapt naturally between modes
- No jarring changes in experience

## 🌓 Dark Mode Strategy

### Backgrounds
- **Light**: Soft white (#F6F2F2) - warm, inviting
- **Dark**: Deep black (#121212) - modern, OLED-friendly

### Surfaces
- **Light**: Pure white with subtle shadows
- **Dark**: Charcoal (#1E1E1E) with neon accents

### Text
- **Light**: Dark text on light backgrounds
- **Dark**: Light text on dark backgrounds
- Gray (#909090) remains consistent for secondary text

### Accents
- Neon green works beautifully in both modes
- Slightly brighter variants in dark mode for visibility
- Status colors adjusted for optimal contrast

## 📱 Component Styling Tips

### Buttons
```typescript
// Primary button: Neon green background, dark text
backgroundColor: theme.colors.primary
color: theme.colors.darkBlack

// Secondary: Dark/light depending on mode
backgroundColor: theme.colors.secondary
color: theme.colors.softWhite

// Outline: Transparent with neon border
backgroundColor: 'transparent'
borderColor: theme.colors.primary
color: theme.colors.primary
```

### Cards
```typescript
// Elevated surface with shadow
backgroundColor: theme.colors.card
borderRadius: theme.radius.l
padding: theme.spacing.m
elevation: 3
```

### Inputs
```typescript
// Clean, minimal style
backgroundColor: theme.colors.surface
borderColor: theme.colors.border
borderRadius: theme.radius.m
padding: theme.spacing.m
color: theme.colors.text
```

## 🎯 Status Colors

```typescript
success: theme.colors.primary  // Neon green for success
warning: '#FFB800'             // Bright yellow-orange
error: '#FF3B3B' / '#FF5252'   // Bright red (light/dark)
info: '#00B8D4' / '#00E5FF'    // Cyan (light/dark)
```

## 🚀 Performance Tips

1. **Memoize styles** when using theme values
2. **Use StyleSheet.create()** for optimization
3. **Extract theme values** at component top level
4. **Avoid inline styles** for frequently rendered components

## 📚 Resources

- Theme types: `src/theme/types.ts`
- Light theme: `src/theme/lightTheme.ts`
- Dark theme: `src/theme/darkTheme.ts`
- Theme hook: `src/theme/ThemeContext.tsx`

---

Built with ⚡ energy and 💚 passion!

