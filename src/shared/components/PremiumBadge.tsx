import React from "react";
import { Text, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "@/shared/theme";
import { Ionicons } from "@expo/vector-icons";

type PremiumBadgeProps = {
  label?: string;
  style?: StyleProp<ViewStyle>;
  width?: ViewStyle["width"];
  labelFontSize?: number;
  isIcon?: boolean;
};

const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  label = "PREMIUM",
  style,
  width,
  labelFontSize,
  isIcon = false,
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
        {isIcon ? <Ionicons name="diamond-outline" size={24} color={theme.colors.background} /> : label}
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
