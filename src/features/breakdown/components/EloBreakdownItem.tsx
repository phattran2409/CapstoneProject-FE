import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

export type EloBreakdownType =
  | "matchResult"
  | "teammateRating"
  | "winStreak"
  | "feedbackContribution"
  | "reputation";

export interface EloBreakdownItemProps {
  type: EloBreakdownType;
  title: string;
  description: string;
  value: string;
  valueDelta?: number; // +15, -5...
}

const ICONS: Record<EloBreakdownType, string> = {
  matchResult: "trophy-outline",
  teammateRating: "people-outline",
  winStreak: "stats-chart-outline",
  feedbackContribution: "football-outline",
  reputation: "shield-checkmark-outline",
};

export const EloBreakdownItem: React.FC<EloBreakdownItemProps> = ({
  type,
  title,
  description,
  value,
  valueDelta,
}) => {
  const { theme } = useTheme();

  const isPositive = (valueDelta ?? 0) >= 0;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons
          name={ICONS[type] as any}
          size={22}
          color={theme.colors.primary}
        />
      </View>

      {/* Texts */}
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary },
          ]}
          numberOfLines={2}
        >
          {description}
        </Text>
      </View>

      {/* Right Value */}
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.valueText,
            { color: isPositive ? theme.colors.primary : theme.colors.error },
          ]}
        >
          {value}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  valueContainer: {
    marginLeft: 12,
    minWidth: 40,
    alignItems: "flex-end",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
  },
});

export default EloBreakdownItem;


