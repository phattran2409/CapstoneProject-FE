import React from "react";
import { StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";
import { ThemedView, ThemedText } from "./themed";
import { useTheme } from "@/shared/theme";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  iconSize?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "document-text-outline",
  title,
  description,
  iconSize = 48,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const resolvedTitle = title ?? t("emptyState.defaultTitle");

  return (
    <ThemedView style={styles.container}>
      <Ionicons
        name={icon}
        size={iconSize}
        color={theme.colors.textSecondary}
      />
      <ThemedText
        variant="primary"
        size="l"
        weight="semiBold"
        style={{ marginTop: theme.spacing.m }}
      >
        {resolvedTitle}
      </ThemedText>
      {description && (
        <ThemedText
          variant="secondary"
          size="m"
          style={{ marginTop: theme.spacing.s, textAlign: "center", paddingLeft: 32, paddingRight: 32 }}
        >
          {description}
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 60,
    alignItems: "center",
    justifyContent: "center",
  },
});
