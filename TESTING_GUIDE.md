# 🧪 Testing Guide

## Manual Testing Checklist

### ✅ Theme System

#### Light Mode
- [ ] App khởi động với Light mode (hoặc theo system)
- [ ] Background màu Soft White (#F6F2F2)
- [ ] Text màu Dark Black (#121212)
- [ ] Primary buttons màu Neon Green (#97FB57)
- [ ] Card có shadow rõ ràng
- [ ] Border colors hiển thị đúng

#### Dark Mode
- [ ] Switch sang Dark mode từ Profile screen
- [ ] Background màu Dark Black (#121212)
- [ ] Text màu Soft White (#F6F2F2)
- [ ] Neon Green nổi bật trên nền tối
- [ ] Card colors tự động thay đổi
- [ ] Tab bar colors đúng

#### Theme Persistence
- [ ] Toggle theme và reload app
- [ ] Theme được giữ nguyên sau reload
- [ ] AsyncStorage lưu theme đúng
- [ ] Theme switch mượt mà, không lag

### ✅ Components

#### Button Component
**Primary Variant**:
- [ ] Background Neon Green
- [ ] Text màu tối
- [ ] Press animation hoạt động
- [ ] Disabled state có opacity giảm
- [ ] Loading state hiển thị spinner

**Secondary Variant**:
- [ ] Background theo theme
- [ ] Text contrast tốt
- [ ] Hoạt động đúng

**Outline Variant**:
- [ ] Border Neon Green
- [ ] Background transparent
- [ ] Text màu Neon Green
- [ ] Hover/press feedback

**Sizes**:
- [ ] Small button nhỏ hơn medium
- [ ] Large button lớn hơn medium
- [ ] Padding consistent

#### Card Component
- [ ] Background màu đúng theo theme
- [ ] Shadow hiển thị (light mode)
- [ ] Elevation hoạt động (Android)
- [ ] Border radius mượt mà
- [ ] Content padding đúng
- [ ] Responsive với nội dung

#### Modal Component
- [ ] Overlay hiển thị
- [ ] Modal centered
- [ ] Close button hoạt động
- [ ] Tap outside đóng modal
- [ ] Animation mượt
- [ ] Content scrollable nếu dài

### ✅ Screens

#### Login Screen
**Layout**:
- [ ] Title hiển thị đúng
- [ ] Email input hoạt động
- [ ] Password input ẩn text
- [ ] Login button hoạt động
- [ ] Keyboard không che input
- [ ] Safe area padding đúng

**Functionality**:
- [ ] Nhập email và password
- [ ] Nhấn login hiển thị loading
- [ ] 1 giây sau navigate đến Home
- [ ] Auth state được update
- [ ] User data được lưu

**Edge Cases**:
- [ ] Empty fields vẫn submit (demo)
- [ ] Keyboard dismiss khi tap ngoài
- [ ] Rotate device vẫn layout đúng

#### Home Screen
**Layout**:
- [ ] Header text hiển thị
- [ ] Welcome card hiển thị
- [ ] Navigation button hiển thị
- [ ] Scroll hoạt động
- [ ] Spacing consistent

**Functionality**:
- [ ] Tap "Go to Profile" navigate đúng
- [ ] Back button hoạt động
- [ ] Theme thay đổi update UI
- [ ] Tab bar hiển thị active state

#### Profile Screen
**Layout**:
- [ ] User info card hiển thị
- [ ] Theme toggle button hiển thị
- [ ] Modal button hiển thị
- [ ] Logout button hiển thị
- [ ] Spacing consistent

**Functionality**:
- [ ] Theme toggle switch theme
- [ ] Modal button mở modal
- [ ] Modal close hoạt động
- [ ] Logout return về Login
- [ ] Auth state cleared

### ✅ Navigation

#### Stack Navigation
- [ ] Login screen là initial route
- [ ] Sau login navigate đến MainTabs
- [ ] Không có back button ở MainTabs
- [ ] Logout quay về Login
- [ ] Deep linking ready (nếu có)

#### Tab Navigation
**Home Tab**:
- [ ] Icon hiển thị đúng
- [ ] Label hiển thị đúng
- [ ] Active state màu Neon Green
- [ ] Tap navigate đúng

**Profile Tab**:
- [ ] Icon hiển thị đúng
- [ ] Label hiển thị đúng
- [ ] Active state màu Neon Green
- [ ] Tap navigate đúng

**Tab Bar**:
- [ ] Background theo theme
- [ ] Border top color đúng
- [ ] Transition mượt
- [ ] Safe area insets

### ✅ State Management

#### Auth Store
**Login**:
- [ ] `login()` set user
- [ ] `isAuthenticated` = true
- [ ] `token` được set
- [ ] UI update accordingly

**Logout**:
- [ ] `logout()` clear user
- [ ] `isAuthenticated` = false
- [ ] `token` = null
- [ ] Navigate về Login

**Update User**:
- [ ] `updateUser()` merge data
- [ ] UI update immediately
- [ ] Không affect auth state

#### App Store
- [ ] `setTheme()` update theme
- [ ] `setLanguage()` update language
- [ ] `setLoading()` update loading
- [ ] All updates trigger re-render

### ✅ Performance

#### Load Times
- [ ] App khởi động < 3s
- [ ] Theme switch instant
- [ ] Navigation < 300ms
- [ ] Image loading smooth
- [ ] No visible lag

#### Memory
- [ ] Không memory leaks
- [ ] Theme switch không tăng memory
- [ ] Navigation không tăng memory
- [ ] Store updates efficient

#### Rendering
- [ ] Không unnecessary re-renders
- [ ] Components memoized nếu cần
- [ ] Theme changes efficient
- [ ] Scroll performance tốt

### ✅ Responsive Design

#### Phone Sizes
- [ ] Small phones (iPhone SE): OK
- [ ] Medium phones (iPhone 12): OK
- [ ] Large phones (iPhone 14 Pro Max): OK
- [ ] Android small: OK
- [ ] Android large: OK

#### Orientations
- [ ] Portrait: Layout đúng
- [ ] Landscape: Layout adapt
- [ ] Rotate smooth
- [ ] No content cut off

#### Safe Areas
- [ ] Top notch/status bar
- [ ] Bottom home indicator
- [ ] No content hidden
- [ ] Padding correct

### ✅ Edge Cases

#### Network
- [ ] Offline: App vẫn load (offline-first ready)
- [ ] Slow connection: Loading states
- [ ] API errors: Error handling
- [ ] Timeout: User feedback

#### Data
- [ ] Empty states handled
- [ ] Long text truncated/wrapped
- [ ] Large images optimized
- [ ] Null/undefined checks

#### User Actions
- [ ] Rapid button taps
- [ ] Multiple modal opens
- [ ] Fast navigation
- [ ] Keyboard show/hide

### ✅ TypeScript

#### Type Safety
- [ ] No TypeScript errors
- [ ] No `any` types (strict)
- [ ] All props typed
- [ ] Navigation types correct
- [ ] Store types correct

#### IDE Support
- [ ] Autocomplete works
- [ ] Error highlighting
- [ ] Go to definition
- [ ] Refactoring support

### ✅ Theme Specific Tests

#### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Buttons stand out
- [ ] Links/actions visible
- [ ] Disabled states clear
- [ ] Status colors distinct

#### Neon Green Usage
- [ ] Primary actions use Neon Green
- [ ] Not overused (balanced)
- [ ] Works in both themes
- [ ] Stands out appropriately
- [ ] Accessible contrast ratios

#### Spacing & Typography
- [ ] Consistent spacing scale
- [ ] Font sizes appropriate
- [ ] Line heights readable
- [ ] Padding/margins consistent
- [ ] Hierarchy clear

## 🧪 How to Test

### 1. Fresh Install
```bash
# Remove node_modules
rm -rf node_modules

# Clean install
npm install --legacy-peer-deps

# Start fresh
npm start
```

### 2. Test Each Feature
- Go through checklist systematically
- Test on different devices
- Test different screen sizes
- Test both themes thoroughly

### 3. Test User Flows
**Flow 1: First Time User**
1. App opens to Login
2. Enter credentials
3. Navigate to Home
4. Explore tabs
5. Change theme
6. Logout

**Flow 2: Returning User**
1. App opens (theme persisted)
2. Already logged in (or to Login)
3. Navigate around
4. Use components
5. Test features

**Flow 3: Theme Testing**
1. Start in Light mode
2. Navigate to Profile
3. Toggle to Dark
4. Navigate to Home
5. Check all screens
6. Reload app
7. Theme persisted

### 4. Test on Real Devices
- **iOS**: iPhone (if possible)
- **Android**: Real device
- **Expo Go**: For quick testing

### 5. Performance Testing
- Use React DevTools
- Monitor re-renders
- Check bundle size
- Measure load times

## 📋 Bug Report Template

```markdown
**Bug Description**:
[Mô tả bug]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[Gì nên xảy ra]

**Actual Behavior**:
[Gì đã xảy ra]

**Environment**:
- Device: 
- OS: 
- Theme: Light/Dark
- Screen: [Screen name]

**Screenshots**:
[Nếu có]

**Additional Context**:
[Thông tin thêm]
```

## ✅ All Tests Passed?

Nếu tất cả tests pass:
- ✅ App sẵn sàng để demo
- ✅ Code quality tốt
- ✅ User experience mượt mà
- ✅ Theme system hoàn hảo
- ✅ Ready to build features!

## 🐛 Found Issues?

1. Document bug với template trên
2. Tạo fix
3. Test lại
4. Check off trong checklist

---

Happy Testing! 🧪⚡

