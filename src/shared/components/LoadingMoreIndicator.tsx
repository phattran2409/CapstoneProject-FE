import React from "react";
import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedView, ThemedText } from "./themed";
import { useTheme } from "@/shared/theme";

interface LoadingMoreIndicatorProps {
  text?: string;
}

export const LoadingMoreIndicator: React.FC<LoadingMoreIndicatorProps> = ({
  text = "Đang tải thêm...",
}) => {
  const { theme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.neonGreen} />
      <ThemedText
        variant="secondary"
        size="s"
        style={{ marginTop: theme.spacing.s }}
      >
        {text}
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
