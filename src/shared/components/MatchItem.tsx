/**
 * MatchItem Component
 * Component có thể tái sử dụng để hiển thị một match item
 */

import React from "react";
import { View, TouchableOpacity, Image, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { ThemedText, ThemedIcon } from "@/shared/components/themed";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getImageSource } from "../utils/imageSource";
import { MatchRoomStatus } from "@/features/rooms";

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
  variant?: "card" | "list" | "compact";
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

  // const imageSource = match.image?.trim()
  //   ? { uri: match.image.trim() }
  //   : PLACEHOLDER_IMAGE;

  const getStatusIcon = (status?: MatchRoomStatus) => {
    switch (status) {
      case "Locked":
        return (
          <Ionicons name="lock-closed" size={24} color={theme.colors.textSecondary} />
        );
      case "Closed":
        return (
          <Ionicons name="close-outline" size={24} color={theme.colors.textSecondary} />
        );
      case "Completed":
        return (
          <Ionicons name="trophy" size={24} color={theme.colors.neonGreen} />
        );
      case "Cancelled":
        return <Ionicons name="sad-outline" size={24} color="#ef4444" />;
      case "Reviewing":
        return (
          <Ionicons name="git-compare-outline" size={24} color="#6b7280" />
        );
      case "InProgress":
        return (
          <Ionicons name="pulse" size={24} color={theme.colors.neonGreen} />
        );
      case "Open":
      case "Full":
        return (
          <Ionicons name="time-outline" size={24} color={theme.colors.info} />
        );
      default:
        return null;
    }
  };

  const getStatusText = (status?: MatchRoomStatus) => {
    if (!status) return "";
    const statusMap: Record<MatchRoomStatus, string> = {
      Open: "Mở",
      Full: "Đã đủ",
      Locked: "Đã khóa",
      Closed: "Đã đóng",
      InProgress: "Đang diễn ra",
      Completed: "Hoàn thành",
      Reviewing: "Đang xem xét",
      Cancelled: "Đã hủy",
    };
    return statusMap[status] || "";
  };

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
          Riêng tư
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
            {getStatusIcon(match.status)}
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default: list variant
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
              {getStatusText(match.status)}
            </ThemedText>
          )}
        </View>
        {match.format && (
          <ThemedText variant="secondary" size="xs" style={styles.listFormat}>
            {match.format} {match.players && `• ${match.players}`}
          </ThemedText>
        )}
      </View>
      {showStatus && match.status && (
        <View style={styles.listStatusIcon}>{getStatusIcon(match.status)}</View>
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
  listFormat: {
    marginTop: 4,
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
});

export default MatchItem;
