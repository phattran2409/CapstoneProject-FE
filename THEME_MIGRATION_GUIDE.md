# Theme Migration Guide

## 🎨 Themed Components Usage

Chúng ta đã tạo các **Themed Components** để tự động responsive với Dark/Light mode.

### 📦 Available Components:
- `ThemedSafeAreaView` - SafeAreaView với theme
- `ThemedView` - View với theme  
- `ThemedScrollView` - ScrollView với theme
- `ThemedText` - Text với theme
- `ThemedCard` - Card component với theme

---

## 🔄 Migration Examples

### **1. SafeAreaView**
```tsx
// ❌ Before (Hardcoded - không responsive)
<SafeAreaView className="flex-1 bg-dark-black">

// ✅ After (Themed - auto responsive)
import { ThemedSafeAreaView } from '../components/themed';
<ThemedSafeAreaView>
```

### **2. View**
```tsx
// ❌ Before
<View className="bg-[#1a1a1a] rounded-2xl p-4">

// ✅ After
import { ThemedView } from '../components/themed';
<ThemedView 
  variant="surface" 
  style={{ borderRadius: 16, padding: 16 }}
>
```

### **3. Text**
```tsx
// ❌ Before
<Text className="text-soft-white text-xl font-bold">Hello</Text>

// ✅ After
import { ThemedText } from '../components/themed';
<ThemedText 
  variant="primary" 
  size="xl" 
  weight="bold"
>
  Hello
</ThemedText>
```

### **4. Secondary Text**
```tsx
// ❌ Before
<Text className="text-medium-gray text-sm">Secondary text</Text>

// ✅ After
<ThemedText variant="secondary" size="s">
  Secondary text
</ThemedText>
```

### **5. Card**
```tsx
// ❌ Before
<View className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">

// ✅ After
import { ThemedCard } from '../components/themed';
<ThemedCard variant="outlined">
  {/* content */}
</ThemedCard>
```

---

## 🎯 Component Props

### **ThemedView**
- `variant`: `'default' | 'card' | 'surface' | 'transparent'`

### **ThemedText**  
- `variant`: `'primary' | 'secondary' | 'tertiary' | 'accent'`
- `size`: `'xs' | 's' | 'm' | 'l' | 'xl' | 'xxl' | 'title' | 'header'`
- `weight`: `'regular' | 'medium' | 'semiBold' | 'bold'`

### **ThemedCard**
- `variant`: `'default' | 'elevated' | 'outlined'`
- `padding`: Custom padding (number)

---

## 📝 Color Mapping

### Dark Mode → Light Mode
| Element | Dark Mode | Light Mode |
|---------|-----------|------------|
| Background | `#121212` | `#F6F2F2` |
| Text | `#F6F2F2` (white) | `#121212` (black) |
| Surface | `#1E1E1E` | `#FFFFFF` |
| Border | `#2C2C2C` | `#E0E0E0` |
| Accent | `#97FB57` (neon green) - same |

---

## 🚀 Quick Migration Steps

1. **Import themed components**:
```tsx
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedCard 
} from '../components/themed';
```

2. **Replace hardcoded classes** with themed components

3. **Use `style` prop** for custom styling (borderRadius, padding, margin...)

4. **Keep `theme.colors` for special cases**:
```tsx
const { theme } = useTheme();
<View style={{ backgroundColor: theme.colors.neonGreen }}>
```

---

## 🎨 Example: Full Screen Migration

```tsx
// ❌ BEFORE
const HomeScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      <View className="px-5 py-4">
        <Text className="text-soft-white text-2xl font-bold">
          Title
        </Text>
        <Text className="text-medium-gray text-sm">
          Subtitle
        </Text>
      </View>
    </SafeAreaView>
  );
};

// ✅ AFTER
import { ThemedSafeAreaView, ThemedView, ThemedText } from '../components/themed';

const HomeScreen = () => {
  return (
    <ThemedSafeAreaView>
      <ThemedView style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
        <ThemedText variant="primary" size="xxl" weight="bold">
          Title
        </ThemedText>
        <ThemedText variant="secondary" size="s">
          Subtitle
        </ThemedText>
      </ThemedView>
    </ThemedSafeAreaView>
  );
};
```

---

## 💡 Tips

1. **Mix with className** cho layout (flexbox, margins...):
```tsx
<ThemedView className="flex-row items-center gap-4">
```

2. **Use theme.colors** cho icon colors:
```tsx
<Ionicons name="star" size={24} color={theme.colors.text} />
```

3. **Special backgrounds** vẫn dùng style:
```tsx
<ThemedView style={{ backgroundColor: theme.colors.neonGreen }}>
```

---

## 🔍 Screens to Migrate
- [x] Components created
- [ ] HomeScreen
- [ ] MatchesScreen  
- [ ] CreateRoomScreen
- [ ] VenueSelectionScreen
- [ ] LeaderboardScreen

Ready to migrate! 🚀

