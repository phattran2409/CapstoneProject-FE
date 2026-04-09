import React, { useState } from "react";
import { View, ScrollView, StyleSheet, ViewStyle, ScrollViewProps } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

interface HorizontalScrollWithHintProps extends ScrollViewProps {
  /** Content rendered inside the horizontal ScrollView */
  children: React.ReactNode;
  /** Extra style applied to the outer wrapper View */
  containerStyle?: ViewStyle;
  /** Threshold (px) before the hint disappears. Default: 8 */
  threshold?: number;
}

/**
 * A horizontal ScrollView that automatically shows a right-edge chevron hint
 * whenever there is more content to scroll to.
 *
 * Usage:
 * ```tsx
 * <HorizontalScrollWithHint containerStyle={{ marginTop: 12 }}>
 *   {items}
 * </HorizontalScrollWithHint>
 * ```
 */
const HorizontalScrollWithHint: React.FC<HorizontalScrollWithHintProps> = ({
  children,
  containerStyle,
  threshold = 8,
  contentContainerStyle,
  scrollEventThrottle = 16,
  ...rest
}) => {
  const { theme } = useTheme();

  const [scrollWidth, setScrollWidth] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const showHint = contentWidth > scrollWidth + scrollX + threshold;

  return (
    <View
      style={[styles.wrapper, containerStyle]}
      onLayout={(e) => setScrollWidth(e.nativeEvent.layout.width)}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={contentContainerStyle}
        onContentSizeChange={(w) => setContentWidth(w)}
        onScroll={(e) => setScrollX(e.nativeEvent.contentOffset.x)}
        {...rest}
      >
        {children}
      </ScrollView>

      {showHint && (
        <View pointerEvents="none" style={styles.hint}>
          <View
            style={[
              styles.hintInner,
              { backgroundColor: theme.colors.mediumGray },
            ]}
          >
            <Ionicons
              name="chevron-forward"
              size={18}
              color={theme.colors.background}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  hint: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    pointerEvents: "none",
  },
  hintInner: {
    borderRadius: 12,
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default HorizontalScrollWithHint;
export type { HorizontalScrollWithHintProps };
