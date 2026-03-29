import React from "react";
import { View, TouchableOpacity } from "react-native";
import { ThemedView, ThemedText, ThemedIcon } from "@/shared/components/themed";
import type { Theme } from "@/shared/theme";
import { teamScreenStyles as styles } from "./teamScreenStyles";

type Props = {
  theme: Theme;
  title: string;
  onBack: () => void;
  onOpenChat: () => void;
};

export const TeamScreenHeader: React.FC<Props> = ({
  theme,
  title,
  onBack,
  onOpenChat,
}) => (
  <ThemedView
    style={[styles.header, { borderBottomColor: theme.colors.border }]}
  >
    <View style={styles.headerLeft}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <ThemedIcon name="arrow-back" size={24} variant="secondary" />
      </TouchableOpacity>
      <ThemedText size="xl" weight="bold">
        {title}
      </ThemedText>
    </View>
    <TouchableOpacity onPress={onOpenChat} style={styles.chatButton}>
      <ThemedIcon name="chatbubbles" size={24} variant="secondary" />
      <View
        style={[
          styles.chatBadge,
          {
            backgroundColor: theme.colors.neonGreen,
            borderColor: theme.colors.background,
          },
        ]}
      >
        <ThemedText size="xs" weight="bold" style={styles.chatBadgeText}>
          5
        </ThemedText>
      </View>
    </TouchableOpacity>
  </ThemedView>
);
