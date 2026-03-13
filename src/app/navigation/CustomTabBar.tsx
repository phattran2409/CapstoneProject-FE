import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, useWindowDimensions, Image, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/shared/theme';
import { useTabBarVisibility } from '@/shared/context/TabBarVisibilityContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TabBadge } from '@/shared/components/TabBadge';
import Svg, { Path } from 'react-native-svg';

const TAB_BAR_CENTER_BUTTON_SIZE = 56;
const TAB_BAR_HEIGHT = 70;

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const { theme } = useTheme();
  const { animatedStyle } = useTabBarVisibility();
  const { width: screenWidth } = useWindowDimensions();

  const handleCreateRoomPress = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('CreateRoom');
    }
  };

  const routes = state.routes;
  const leftRoutes = routes.slice(0, 2);
  const rightRoutes = routes.slice(2, 4);
  const isTablet =  screenWidth >= 750 ? true : false;

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
          color: isFocused ? theme.colors.neonGreen : theme.colors.white,
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
              color: isFocused ? theme.colors.neonGreen : theme.colors.white,
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

  // Tính toán path cho shape cong ở giữa (cho nút +)
  const horizontalPadding = 20;
  const barWidth = screenWidth - horizontalPadding * 2;
  const centerX = barWidth / 2;
  const curveWidth = 112;
  const curveDepth = 28; // độ cao phần cong lên
  const leftCurveStart = centerX - curveWidth / 2;
  const rightCurveEnd = centerX + curveWidth / 2;

  //
  const REF_WIDTH = 371;
  const REF_HEIGHT = isTablet ? 70 : 100; 
  // const curvedPath = `
  //   M0,${curveDepth}
  //   Q0,27,14,27
  //   H129.7143
  //   C${leftCurveStart + 16},${curveDepth} ${centerX - 28},0 ${centerX},0
  //   C${centerX + 28},0 ${rightCurveEnd - 16},${curveDepth} ${rightCurveEnd},${curveDepth}
  //   H360
  //   Q371,28,371,41
  //   V81
  //   Q371,94,360,94
  //   H14
  //   Q0,94,0,81
  //   Z
  // `;
  const curvedPath = "M 0 40 Q 0 27 15 27 H 129.7143 C 145.7143 28 157.7143 0 185.7143 0 C 213.7143 0 225.7143 28 241.7143 28 H 360 Q 371 28 371 41 V 81 Q 371 94 360 94 H 15 Q 0 94 0 81 Z";
  return (
    <Animated.View
      style={[
        styles.tabBarOuter,
        {
          bottom: 0,
          left: horizontalPadding,
          right: horizontalPadding,
          height: TAB_BAR_HEIGHT,
        },
        animatedStyle,
      ]}
    >
      <BlurView
        intensity={10}
        tint="dark"
        style={styles.blurContainer}
      >
        {/* Nền cong phía sau */}
        <Svg
          width={barWidth}
          height={(barWidth / REF_WIDTH) * REF_HEIGHT}
          viewBox={`0 0 ${REF_WIDTH} ${REF_HEIGHT}`}
          style={styles.curvedBackground}
        >
          <Path
            d={curvedPath}
            fill={theme.colors.darkBlack + '60'}
            stroke={theme.colors.neonGreen + '40'}
            strokeWidth={1.5}
          />
        </Svg>

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
                  position: 'absolute',
                  top: -20,
                },
              ]}
            >
              <Image source={require('@assets/icons/match-room-create.png')} style={{ width: 35, height: 35 }} />
            </TouchableOpacity>
          </View>
          <View style={styles.tabBarSide}>
            {rightRoutes.map((route, index) => renderTab(route, index, false))}
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    elevation: 0,
    overflow: 'visible',
  },
  blurContainer: {
    // flex: 1,
    // borderRadius: 24,
    // overflow: 'hidden',
    // // borderColor: 'rgba(255,255,255,0.16)',
    // backgroundColor: 'rgba(0,0,0,0.25)',
  },
  curvedBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  tabBarContent: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  tabBarSide: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  centerButtonWrapper: {
    width: TAB_BAR_CENTER_BUTTON_SIZE,
    height: TAB_BAR_CENTER_BUTTON_SIZE,
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

