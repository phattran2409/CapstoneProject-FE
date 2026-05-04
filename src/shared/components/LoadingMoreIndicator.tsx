import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { ThemedView, ThemedText } from "./themed";
import { useTheme } from "@/shared/theme";

interface LoadingMoreIndicatorProps {
  text?: string;
}

export const LoadingMoreIndicator: React.FC<LoadingMoreIndicatorProps> = ({
  text,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const resolvedText = text ?? t("common.buttons.loadingMore");

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.neonGreen} />
      <ThemedText
        variant="secondary"
        size="s"
        style={{ marginTop: theme.spacing.s }}
      >
        {resolvedText}
      </ThemedText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: "center",
  },
});
