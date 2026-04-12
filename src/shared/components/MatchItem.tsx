/**
 * MatchItem Component
 * Component có thể tái sử dụng để hiển thị một match item
 */

import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { ThemedText } from "@/shared/components/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getImageSource } from "../utils/imageSource";
import { getMatchFormatBadgeColor } from "../utils/matchFormatColors";
import { matchRoomStatusI18nKey } from "../utils/matchRoomStatus";
import { MatchRoomStatusIcon } from "./MatchRoomStatusIcon";
import { MatchRoomStatus } from "@/features/rooms";
import { useTranslation } from "react-i18next";
export interface MatchItemData {
  id: string;
  title: string;
  format?: string;
  players?: string;
  image: string | any;
  date?: string;
  status?: MatchRoomStatus;
  venue?: string;
  time?: string;
  /** Hiển thị badge "Riêng tư" khi true */
  isPrivate?: boolean;
}

export interface MatchItemProps {
  match: MatchItemData;
  variant?: "card" | "list" | "compact" | "third";
  onPress?: (matchId: string) => void;
  showStatus?: boolean;
}

// const PLACEHOLDER_IMAGE = require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png');

const MatchItem: React.FC<MatchItemProps> = ({
  match,
  variant = "list",
  onPress,
  showStatus = true,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const PrivateBadge = () =>
    match.isPrivate ? (
      <View
        style={[styles.privateBadge, { backgroundColor: theme.colors.surface }]}
      >
        <Ionicons
          name="lock-closed"
          size={12}
          color={theme.colors.textSecondary}
        />
        <ThemedText size="xs" weight="semiBold" style={styles.privateBadgeText}>
          {t("matches.privateLabel", "Riêng tư")}
        </ThemedText>
      </View>
    ) : null;

    if (variant === "card") {
    return (
      <TouchableOpacity
        style={[
          styles.cardContainer,
          {
            borderColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
          },
        ]}
        onPress={() => onPress?.(match.id)}
        activeOpacity={0.8}
      >
        <View style={styles.cardImageWrapper}>
          <Image
            source={getImageSource(match.image)}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <PrivateBadge />
        </View>
        <View style={styles.cardContent}>
          <ThemedText size="l" weight="bold" style={styles.cardTitle}>
            {match.title}
          </ThemedText>
          {match.format && (
            <ThemedText
              variant="secondary"
              size="s"
              style={styles.cardSubtitle}
            >
              {match.format} {match.players && `- (${match.players})`}
            </ThemedText>
          )}
          {match.date && (
            <ThemedText variant="secondary" size="xs" style={styles.cardDate}>
              {match.date}
            </ThemedText>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "third") {
    const startTime = match.time?.split("-")?.[0]?.trim() ?? "";
    const dateLabel = match.date ?? "";

    return (
      <TouchableOpacity
        style={[
          styles.thirdContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => onPress?.(match.id)}
        activeOpacity={0.9}
      >
        <View style={styles.thirdHeaderRow}>
          <ThemedText size="l" weight="bold" style={styles.thirdTitle}>
            {match.title}
          </ThemedText>

          {/* <View
            style={[
              styles.thirdManagePill,
              { backgroundColor: theme.colors.neonGreen },
            ]}
          >
            <ThemedText
              size="xs"
              weight="bold"
              style={{ color: theme.colors.background }}
            >
              {t("matches.manageBadge", "QUẢN LÝ")}
            </ThemedText>
          </View> */}
        </View>

        <View style={styles.thirdMetaRow}>
          <Ionicons name="people-outline" size={18} color={theme.colors.textSecondary} />
          <ThemedText variant="secondary" size="s">
            {match.format} {match.players ? `• ${match.players}` : ""}
          </ThemedText>
        </View>

        <View style={styles.thirdDivider} />

        <View style={styles.thirdInfoRow}>
          <Ionicons name="time-outline" size={18} color={theme.colors.textSecondary} />
          <ThemedText variant="secondary" size="m">
            {startTime}
            {dateLabel ? ` - ${dateLabel}` : ""}
          </ThemedText>
        </View>

        <View style={styles.thirdInfoRow}>
          <Ionicons name="location-outline" size={18} color={theme.colors.textSecondary} />
          <ThemedText variant="secondary" size="m" numberOfLines={1}>
            {match.venue}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[
            styles.thirdDetailButton,
            { backgroundColor: theme.colors.neonGreen },
          ]}
          onPress={() => onPress?.(match.id)}
          activeOpacity={0.9}
        >
          <ThemedText
            size="m"
            weight="bold"
            style={{ color: theme.colors.background }}
          >
            {t("matches.detailButton", "Chi tiết")}
          </ThemedText>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  if (variant === "compact") {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => onPress?.(match.id)}
        activeOpacity={0.8}
      >
        <View style={styles.compactImageWrapper}>
          <Image
            source={getImageSource(match.image)}
            style={styles.compactImage}
            resizeMode="cover"
          />
          <PrivateBadge />
        </View>
        <View style={styles.compactContent}>
          <ThemedText size="m" weight="semiBold" numberOfLines={1}>
            {match.title}
          </ThemedText>
          {match.date && (
            <ThemedText variant="secondary" size="xs">
              {match.date}
            </ThemedText>
          )}
        </View>
        {showStatus && match.status && (
          <View style={styles.compactStatus}>
            <MatchRoomStatusIcon status={match.status} />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default: list variant
  const formatAccent = getMatchFormatBadgeColor(
    match.format,
    theme.colors.primary,
  );

  return (
    <TouchableOpacity
      style={[
        styles.listContainer,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.l,
        },
      ]}
      onPress={() => onPress?.(match.id)}
      activeOpacity={0.8}
    >
      <View style={styles.listImageWrapper}>
        <Image
          source={getImageSource(match.image)}
          style={styles.listImage}
          resizeMode="cover"
        />
        <PrivateBadge />
      </View>
      <View style={styles.listContent}>
        <ThemedText
          size="m"
          weight="semiBold"
          style={styles.listTitle}
          numberOfLines={1}
        >
          {match.title}
        </ThemedText>
        <View style={styles.listSubtitle}>
          {match.date && (
            <ThemedText variant="secondary" size="s">
              {match.date}
            </ThemedText>
          )}
          {match.status && showStatus && (
            <ThemedText variant="secondary" size="s" style={styles.listStatus}>
              {match.date && " - "}
              {t(matchRoomStatusI18nKey(match.status))}
            </ThemedText>
          )}
        </View>
        {(match.format || match.players) && (
          <View style={styles.listFormatRow}>
            {match.format ? (
              <View
                style={[
                  styles.formatBadge,
                  {
                    backgroundColor: formatAccent + "20",
                    borderColor: formatAccent,
                  },
                ]}
              >
                <ThemedText size="xs" weight="bold" style={{ color: formatAccent }}>
                  {match.format}
                </ThemedText>
              </View>
            ) : null}
            {match.players ? (
              <ThemedText variant="secondary" size="xs" style={styles.listPlayers}>
                {match.format ? ` • ${match.players}` : match.players}
              </ThemedText>
            ) : null}
          </View>
        )}
      </View>
      {showStatus && match.status && (
        <View style={styles.listStatusIcon}>
          <MatchRoomStatusIcon status={match.status} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Card variant styles
  cardContainer: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    width: 280,
  },
  cardImageWrapper: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 160,
  },
  privateBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  privateBadgeText: {
    marginTop: 0,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    marginBottom: 8,
  },
  cardSubtitle: {
    marginBottom: 4,
  },
  cardDate: {
    marginTop: 4,
  },
  // List variant styles
  listContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 12,
  },
  listImageWrapper: {
    position: "relative",
  },
  listImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  listContent: {
    flex: 1,
    marginLeft: 16,
  },
  listTitle: {
    marginBottom: 4,
  },
  listSubtitle: {
    flexDirection: "row",
    marginBottom: 4,
  },
  listStatus: {
    marginLeft: 4,
  },
  listFormatRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  listPlayers: {
    flexShrink: 1,
  },
  listStatusIcon: {
    marginLeft: 12,
  },
  // Compact variant styles
  compactContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  compactImageWrapper: {
    position: "relative",
  },
  compactImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  compactContent: {
    flex: 1,
    marginLeft: 12,
  },
  compactStatus: {
    marginLeft: 8,
  },
  // Third (screenshot-matching) variant styles
  thirdContainer: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    width: 340,
    maxWidth: "100%",
  },
  thirdHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  thirdTitle: {
    flex: 1,
  },
  thirdManagePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  thirdMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  thirdDivider: {
    height: 1,
    backgroundColor: "#2e2e2e",
    marginVertical: 12,
  },
  thirdInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 6,
  },
  thirdDetailButton: {
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default MatchItem;
