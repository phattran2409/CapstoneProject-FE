import React from "react";
import { Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme";

type PremiumBadgeProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  width?: ViewStyle["width"];
  labelFontSize?: number;
};

const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  label = "PREMIUM",
  style,
  width,
  labelFontSize,
}) => {
  const { theme } = useTheme();

  return (
    <LinearGradient
      colors={["#FFD700", "#FFA500"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[
        styles.badge,
        {
          paddingHorizontal: theme.spacing.m,
          width,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: theme.colors.background,
            fontSize: labelFontSize ?? theme.fontSizes.s,
          },
        ]}
      >
        {label}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingVertical: 6,
  },
  label: {
    fontWeight: "800",
    letterSpacing: 1,
  },
});

export default PremiumBadge;
