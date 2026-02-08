import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";

interface TypingIndicatorProps {
  userName: string;
  customText?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  userName,
  customText,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.parallel([
            Animated.timing(dot1, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot2, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(dot3, {
              toValue: 0,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ).start();
    };
    animateDots();
  }, [dot1, dot2, dot3]);

  const displayText = customText || `${userName} ${t("chat.isTyping")}`;

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.m,
        paddingVertical: theme.spacing.s,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      }}
    >
      <View
        style={{
          backgroundColor: theme.colors.border,
          borderRadius: theme.radius.l,
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.s,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSizes.s,
            color: theme.colors.text,
            marginRight: theme.spacing.xs,
          }}
        >
          {displayText}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.textSecondary,
              marginRight: 4,
              opacity: dot1.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot1.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
          />
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.textSecondary,
              marginRight: 4,
              opacity: dot2.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot2.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
          />
          <Animated.View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: theme.colors.textSecondary,
              opacity: dot3.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
              transform: [
                {
                  scale: dot3.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.2],
                  }),
                },
              ],
            }}
          />
        </View>
      </View>
    </View>
  );
};
