import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { useTheme } from '@/shared/theme';
import { useTabBarVisibility } from '@/shared/context/TabBarVisibilityContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabBadge } from '@/shared/components/TabBadge';

const TAB_BAR_CENTER_BUTTON_SIZE = 56;
const TAB_BAR_HEIGHT = 70;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const { animatedStyle } = useTabBarVisibility();

  const handleCreateRoomPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('CreateRoom');
    }
  };

  const routes = state.routes;
  const leftRoutes = routes.slice(0, 2);
  const rightRoutes = routes.slice(2, 4);

  const renderTab = (route: (typeof routes)[0], index: number, isLeft: boolean) => {
    const globalIndex = isLeft ? index : index + 2;
    const { options } = descriptors[route.key];
    const label =
      options.tabBarLabel !== undefined
        ? options.tabBarLabel
        : options.title !== undefined
          ? options.title
          : route.name;
    const isFocused = state.index === globalIndex;

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
      navigation.emit({ type: 'tabLongPress', target: route.key });
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
        <View style={[isFocused && styles.iconContainerActive]}>
          {iconElement}
          {route.name === 'Matches' && <TabBadge />}
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
  };

  return (
    <Animated.View
      style={[
        styles.tabBarContainer,
        {
          bottom: 20,
          left: 20,
          right: 20,
          height: TAB_BAR_HEIGHT,
          borderRadius: 25,
          backgroundColor: theme.colors.darkBlack + 'F0',
          borderWidth: 1.5,
          borderColor: theme.colors.neonGreen + '40',
          shadowColor: theme.colors.neonGreen,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 20,
        },
        animatedStyle,
      ]}
    >
      <View style={styles.tabBarContent}>
        <View style={styles.tabBarSide}>
          {leftRoutes.map((route, index) => renderTab(route, index, true))}
        </View>

        {/* Vùng giữa: nút plus nâng lên, nằm trong vòm */}
        <View style={styles.centerButtonWrapper}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Tạo phòng"
            onPress={handleCreateRoomPress}
            activeOpacity={0.85}
            style={[
              styles.centerButton,
              {
                backgroundColor: theme.colors.neonGreen,
                shadowColor: theme.colors.neonGreen,
              },
            ]}
          >
            <Ionicons name="add" size={28} color={theme.colors.background} />
          </TouchableOpacity>
        </View>

        <View style={styles.tabBarSide}>
          {rightRoutes.map((route, index) => renderTab(route, index, false))}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    elevation: 0,
    overflow: 'visible',
  },
  tabBarContent: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  tabBarSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  centerButtonWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: TAB_BAR_CENTER_BUTTON_SIZE,
    height: TAB_BAR_CENTER_BUTTON_SIZE,
    borderRadius: TAB_BAR_CENTER_BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
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

