import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { ThemedView, ThemedText } from "@/shared/components/themed";
import type { Theme } from "@/shared/theme";
import type { MatchRoomFullInfo } from "@/features/rooms/types/room.types";
import { teamScreenStyles as styles } from "./teamScreenStyles";

type Props = {
  theme: Theme;
  t: (key: string) => string;
  formatDate: (date: string) => string;
  displayRoom: MatchRoomFullInfo | null;
  formatForFormation: string;
  displayTeamName: string;
  isCaptain: boolean;
  teamNameInput: string;
  onTeamNameChange: (text: string) => void;
  onSaveTeamName: () => void;
  isSavingTeamName: boolean;
};

export const TeamMatchInfoSection: React.FC<Props> = ({
  theme,
  t,
  formatDate,
  displayRoom,
  formatForFormation,
  displayTeamName,
  isCaptain,
  teamNameInput,
  onTeamNameChange,
  onSaveTeamName,
  isSavingTeamName,
}) => (
  <View style={styles.matchInfoSection}>
    <ThemedView
      style={[styles.matchInfoCard, { backgroundColor: theme.colors.surface }]}
    >
      <View>
        <ThemedText
          variant="secondary"
          size="xs"
          style={styles.matchInfoLabel}
        >
          {t("roomDetail.venue")}
        </ThemedText>
        <ThemedText variant="primary" size="m" weight="medium">
          {displayRoom?.field?.venue?.venueName ?? "—"}
        </ThemedText>
      </View>
    </ThemedView>

    <ThemedView
      style={[styles.matchInfoCard, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.teamNameContainer}>
        <ThemedText
          variant="secondary"
          size="xs"
          style={styles.matchInfoLabel}
        >
          {t("roomDetail.teamName")}
        </ThemedText>
        <View style={styles.teamNameBlock}>
          {isCaptain ? (
            <>
              <TextInput
                style={[
                  styles.teamNameInput,
                  {
                    color: theme.colors.textPrimary,
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
                placeholder={t("teamScreen.enterTeamName")}
                placeholderTextColor={theme.colors.textSecondary}
                value={teamNameInput}
                onChangeText={onTeamNameChange}
                maxLength={50}
                editable={!isSavingTeamName}
              />
              <TouchableOpacity
                style={[
                  styles.teamNameSaveBtn,
                  {
                    backgroundColor: theme.colors.neonGreen,
                    opacity: isSavingTeamName ? 0.6 : 1,
                  },
                ]}
                onPress={onSaveTeamName}
                disabled={isSavingTeamName}
              >
                <ThemedText size="s" weight="bold" style={{ color: "#000" }}>
                  {isSavingTeamName
                    ? t("teamScreen.savingTeamName")
                    : t("teamScreen.saveTeamName")}
                </ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <ThemedText variant="primary" size="m" weight="semiBold">
              {displayTeamName}
            </ThemedText>
          )}
        </View>
      </View>
    </ThemedView>

    <ThemedView
      style={[styles.matchInfoCard, { backgroundColor: theme.colors.surface }]}
    >
      <View>
        <ThemedText
          variant="secondary"
          size="xs"
          style={styles.matchInfoLabel}
        >
          {t("roomDetail.datetime")}
        </ThemedText>
        <ThemedText variant="primary" size="l" weight="semiBold">
          {formatDate(displayRoom?.matchDate || "")}
        </ThemedText>
      </View>
      <View>
        <ThemedText
          variant="secondary"
          size="xs"
          style={styles.matchInfoLabel}
        >
          {t("roomDetail.status")}
        </ThemedText>
        <ThemedText
          variant="accent"
          size="m"
          weight="bold"
          style={{ color: theme.colors.neonGreen }}
        >
          {displayRoom?.status === "Open" ? t("roomDetail.statusUpcoming") : ""}
        </ThemedText>
      </View>
    </ThemedView>

    <ThemedView
      style={[styles.formatTeamCard, { backgroundColor: theme.colors.surface }]}
    >
      <View>
        <ThemedText
          variant="secondary"
          size="s"
          style={styles.formatLabel}
        >
          {t("roomDetail.format")}
        </ThemedText>
        <View style={styles.formatContainer}>
          <View
            style={[
              styles.formatBadge,
              { backgroundColor: theme.colors.neonGreen + "20" },
            ]}
          >
            <ThemedText
              variant="accent"
              size="m"
              weight="bold"
              style={{ color: theme.colors.neonGreen }}
            >
              {formatForFormation}
            </ThemedText>
          </View>
        </View>
      </View>
      <View>
        <ThemedText
          variant="tertiary"
          size="s"
          style={styles.matchInfoLabel}
        >
          {t("roomDetail.teamCountLabel")}
        </ThemedText>
        <View
          style={[
            styles.teamCountBadge,
            { backgroundColor: theme.colors.neonGreen + "15" },
          ]}
        >
          <ThemedText
            variant="secondary"
            size="s"
            style={{ color: theme.colors.neonGreen }}
          >
            {displayRoom
              ? `${displayRoom.filledSlots}/${displayRoom.totalSlots}`
              : "0/0"}
          </ThemedText>
        </View>
      </View>
    </ThemedView>
  </View>
);
