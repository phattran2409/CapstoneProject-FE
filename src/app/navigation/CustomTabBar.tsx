import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useTabBarVisibility } from '@/shared/context/TabBarVisibilityContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabBadge } from '@/shared/components/TabBadge';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const { animatedStyle } = useTabBarVisibility();

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 25,
          shadowColor: theme.colors.neonGreen,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.tabBarBackground}>
        <BlurView
          intensity={80}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
        {/* Gradient Overlay */}
        <View style={[styles.gradientOverlay, { backgroundColor: theme.colors.darkBlack + '40' }]} />
        {/* Glass Border */}
        <View style={[styles.glassBorder, { 
          borderColor: theme.colors.neonGreen + '30',
          shadowColor: theme.colors.neonGreen,
        }]} />
        {/* Inner Glow */}
        <View style={[styles.innerGlow, { backgroundColor: theme.colors.neonGreen + '05' }]} />
      </View>

      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const iconElement = options.tabBarIcon
            ? (options.tabBarIcon as any)({
                focused: isFocused,
                color: isFocused ? theme.colors.neonGreen : theme.colors.textSecondary,
                size: 24,
              })
            : null;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as Record<string, unknown>).tabBarTestID as string | undefined}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
            >
              <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                {iconElement}
                {/* Hiển thị badge khi có active room ở tab Matches */}
                {route.name === 'Matches' && <TabBadge />}
                {isFocused && (
                  <View style={[styles.activeIndicator, { backgroundColor: theme.colors.neonGreen }]} />
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? theme.colors.neonGreen : theme.colors.textSecondary,
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 5,
                  },
                ]}
              >
                {typeof label === 'string' ? label : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    elevation: 0,
  },
  tabBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  glassBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  innerGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 25,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconContainerActive: {
    transform: [{ scale: 1.1 }],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -8,
    width: 4,
    height: 4,
    borderRadius: 2,
    shadowColor: '#90EE90',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  tabLabel: {
    marginTop: 4,
  },
});

