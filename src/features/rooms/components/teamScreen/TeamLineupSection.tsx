import React, { type Dispatch, type SetStateAction } from "react";
import { View, ScrollView, Image, TouchableOpacity } from "react-native";
import {
  FormationField,
  type FormationConfig,
  type FormationPlayer,
  type PositionLine,
  type SlotAssignment,
} from "@/shared/components/formation";
import { ThemedView, ThemedText, ThemedIcon } from "@/shared/components/themed";
import { Button } from "@/shared/components";
import type { Theme } from "@/shared/theme";
import { CaptainBadge } from "@/features/rooms/components";
import { teamScreenStyles as styles } from "./teamScreenStyles";

type Props = {
  theme: Theme;
  t: (key: string, opts?: Record<string, string | number>) => string;
  myAssignedSlotLabel: string | null;
  formationConfig: FormationConfig | null;
  formationPlayers: FormationPlayer[];
  assignments: SlotAssignment[];
  selectedFormation: string;
  formatForFormation: "5vs5" | "7vs7" | "11vs11";
  isCaptain: boolean;
  availableFormations: string[];
  isLineupDropdownOpen: boolean;
  setIsLineupDropdownOpen: (open: boolean) => void;
  setSelectedFormation: (name: string) => void;
  handleAssignToSlot: (slotId: string) => void;
  selectedPlayerId: string | null;
  setSelectedPlayerId: Dispatch<SetStateAction<string | null>>;
  onSaveFormation: () => void;
};

export const TeamLineupSection: React.FC<Props> = ({
  theme,
  t,
  myAssignedSlotLabel,
  formationConfig,
  formationPlayers,
  assignments,
  selectedFormation,
  formatForFormation,
  isCaptain,
  availableFormations,
  isLineupDropdownOpen,
  setIsLineupDropdownOpen,
  setSelectedFormation,
  handleAssignToSlot,
  selectedPlayerId,
  setSelectedPlayerId,
  onSaveFormation,
}) => (
  <>
    {myAssignedSlotLabel && (
      <ThemedView
        style={[
          styles.myPositionCard,
          {
            backgroundColor: theme.colors.neonGreen + "18",
            borderColor: theme.colors.neonGreen + "40",
          },
        ]}
      >
        <ThemedText
          variant="secondary"
          size="s"
          style={styles.myPositionLabel}
        >
          {t("teamScreen.myPosition")}
        </ThemedText>
        <ThemedText
          variant="primary"
          size="l"
          weight="bold"
          style={{ color: theme.colors.neonGreen }}
        >
          {myAssignedSlotLabel}
        </ThemedText>
      </ThemedView>
    )}

    {formationConfig && (
      <View style={{ marginBottom: 20 }}>
        <FormationField
          players={formationPlayers}
          format={formatForFormation as "5vs5" | "7vs7"}
          formationName={selectedFormation}
          initialAssignments={assignments}
          editable={false}
          showBench={false}
        />
      </View>
    )}

    {isCaptain && (
      <View style={styles.lineupSelectorContainer}>
        <ThemedText variant="secondary" size="s" style={styles.lineupLabel}>
          {t("teamScreen.selectFormation")}
        </ThemedText>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => setIsLineupDropdownOpen(!isLineupDropdownOpen)}
          >
            <ThemedText variant="primary" size="m" weight="semiBold">
              {selectedFormation}
            </ThemedText>
            <ThemedIcon
              name={isLineupDropdownOpen ? "chevron-up" : "chevron-down"}
              size={20}
              variant="secondary"
            />
          </TouchableOpacity>

          {isLineupDropdownOpen && (
            <View
              style={[
                styles.dropdownMenu,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              {availableFormations.map((formation) => (
                <TouchableOpacity
                  key={formation}
                  style={[
                    styles.dropdownItem,
                    {
                      backgroundColor:
                        selectedFormation === formation
                          ? theme.colors.neonGreen + "20"
                          : "transparent",
                      borderBottomWidth:
                        formation !==
                        availableFormations[availableFormations.length - 1]
                          ? 1
                          : 0,
                      borderBottomColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => {
                    setSelectedFormation(formation);
                    setIsLineupDropdownOpen(false);
                  }}
                >
                  <ThemedText
                    variant="primary"
                    size="m"
                    weight={
                      selectedFormation === formation ? "bold" : "medium"
                    }
                    style={{
                      color:
                        selectedFormation === formation
                          ? theme.colors.neonGreen
                          : theme.colors.textPrimary,
                    }}
                  >
                    {formation}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    )}

    {isCaptain && formationConfig && (
      <View style={styles.roleCardsSection}>
        <ThemedText variant="secondary" size="s" style={styles.sectionLabel}>
          {t("teamScreen.positionOnField")}
        </ThemedText>
        {(["GK", "DF", "MF", "FW"] as PositionLine[]).map((line) => {
          const slots = formationConfig.slots.filter((s) => s.line === line);
          if (slots.length === 0) return null;
          return (
            <ThemedView
              key={line}
              style={[
                styles.roleCard,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <View style={styles.roleCardHeader}>
                <ThemedText size="m" weight="bold">
                  {line}
                </ThemedText>
                <View
                  style={[
                    styles.roleBadge,
                    { backgroundColor: theme.colors.neonGreen + "25" },
                  ]}
                >
                  <ThemedText
                    size="xs"
                    weight="bold"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    {line}
                  </ThemedText>
                </View>
              </View>
              {slots.map((slot) => {
                const current = assignments.find((a) => a.slotId === slot.id);
                const currentPlayer = formationPlayers.find(
                  (p) => p.id === current?.playerId,
                );
                return (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.roleSlotRow,
                      {
                        borderBottomColor: theme.colors.border,
                        backgroundColor: currentPlayer
                          ? theme.colors.neonGreen + "12"
                          : "transparent",
                      },
                    ]}
                    onPress={() => isCaptain && handleAssignToSlot(slot.id)}
                    activeOpacity={0.7}
                  >
                    <ThemedText size="s" variant="secondary">
                      {slot.label}
                    </ThemedText>
                    <ThemedText
                      size="s"
                      weight={currentPlayer ? "semiBold" : "medium"}
                      variant={currentPlayer ? "primary" : "secondary"}
                    >
                      {currentPlayer
                        ? currentPlayer.name
                        : t("teamScreen.tapToAssign")}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          );
        })}
      </View>
    )}

    {isCaptain && (
      <View style={styles.playerListSection}>
        <ThemedText variant="secondary" size="s" style={styles.sectionLabel}>
          {t("teamScreen.playerListHint")}
        </ThemedText>
        {selectedPlayerId && (
          <ThemedText size="xs" variant="secondary" style={styles.hint}>
            {t("teamScreen.selectedPlayerHint")}
          </ThemedText>
        )}
        <ScrollView
          style={styles.playerListScroll}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {formationPlayers.map((player, index) => {
            const assigned = assignments.find((a) => a.playerId === player.id);
            const slot = assigned
              ? formationConfig?.slots.find((s) => s.id === assigned.slotId)
              : null;
            const isSelected = selectedPlayerId === player.id;
            return (
              <TouchableOpacity
                key={`${player.id}-${index}`}
                style={[
                  styles.playerRow,
                  {
                    borderColor: theme.colors.border,
                    backgroundColor: isSelected
                      ? theme.colors.neonGreen + "20"
                      : theme.colors.surface,
                    borderLeftWidth: isSelected ? 4 : 0,
                    borderLeftColor: theme.colors.neonGreen,
                  },
                ]}
                onPress={() => {
                  if (!isCaptain) return;
                  setSelectedPlayerId((prev) =>
                    prev === player.id ? null : player.id,
                  );
                }}
                activeOpacity={0.7}
              >
                <View style={styles.playerRowLeft}>
                  {player.avatar ? (
                    <Image
                      source={player.avatar}
                      style={styles.playerAvatar}
                    />
                  ) : (
                    <View
                      style={[
                        styles.playerAvatarPlaceholder,
                        { backgroundColor: theme.colors.border },
                      ]}
                    >
                      <ThemedText size="s" weight="bold">
                        {player.name?.charAt(0) || "?"}
                      </ThemedText>
                    </View>
                  )}
                  <View>
                    <View style={styles.playerNameRow}>
                      <ThemedText
                        size="m"
                        weight={isSelected ? "bold" : "medium"}
                      >
                        {player.name}
                      </ThemedText>
                      {player.isCaptain && <CaptainBadge compact />}
                    </View>
                    {player.role && (
                      <ThemedText size="xs" variant="secondary">
                        {player.role}
                        {slot ? ` → ${slot.label}` : ""}
                      </ThemedText>
                    )}
                  </View>
                </View>
                {isSelected && (
                  <ThemedIcon
                    name="checkmark-circle"
                    size={22}
                    color={theme.colors.neonGreen}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    )}

    {isCaptain && (
      <View style={styles.saveButtonContainer}>
        <Button title={t("teamScreen.saveFormation")} onPress={onSaveFormation} />
      </View>
    )}
  </>
);
