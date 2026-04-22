import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  isUnlocked: boolean;
  status?: string; // "InProgress" | "Claimable" | "Claimed"
  unlockedAt?: string;
  progress?: number; // 0-100
  rarity?: "common" | "rare" | "epic" | "legendary";
}

interface AchievementItemProps {
  achievement: Achievement;
  onPress?: (achievement: Achievement) => void;
}

export const AchievementItem: React.FC<AchievementItemProps> = ({
  achievement,
  onPress,
}) => {
  const { theme } = useTheme();

  // Get rarity color
  const getRarityColor = (rarity?: string): string => {
    switch (rarity) {
      case "legendary":
        return "#FFD700"; // Gold
      case "epic":
        return "#9C27B0"; // Purple
      case "rare":
        return "#2196F3"; // Blue
      case "common":
      default:
        return "#607D8B"; // Gray
    }
  };

  const rarityColor = getRarityColor(achievement.rarity);
  const isClaimable = achievement.status === "Claimable";
  const isUnlocked = achievement.isUnlocked || isClaimable;
  const isLocked = !isUnlocked;
  const progress = achievement.progress ?? 0;

  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const badgeColor = isClaimable
    ? "#FFD700"
    : isUnlocked
      ? theme.colors.success
      : "rgba(80,80,80,0.9)";

  const badgeIcon: keyof typeof Ionicons.glyphMap = isClaimable
    ? "gift"
    : isUnlocked
      ? "checkmark"
      : "lock-closed";

  const iconColor = isLocked
    ? theme.colors.textSecondary
    : isClaimable
      ? "#FFD700"
      : rarityColor;

  const gradientColors: [string, string] = isLocked
    ? ["rgba(255,255,255,0.03)", "transparent"]
    : isClaimable
      ? ["rgba(255,215,0,0.12)", "transparent"]
      : [`${rarityColor}20`, "transparent"];

  return (
    <TouchableOpacity
      onPress={() => onPress?.(achievement)}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <BlurView
        intensity={isLocked ? 15 : 40}
        tint="dark"
        style={[
          styles.container,
          {
            borderRadius: theme.radius.m,
            opacity: isLocked ? 0.55 : 1,
            borderColor: isClaimable
              ? "rgba(255,215,0,0.35)"
              : "rgba(255,255,255,0.1)",
          },
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Icon */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isLocked
                  ? `${theme.colors.border}20`
                  : isClaimable
                    ? "rgba(255,215,0,0.18)"
                    : `${rarityColor}30`,
              },
            ]}
          >
            <Ionicons name={achievement.icon} size={32} color={iconColor} />
            <View
              style={[styles.statusBadge, { backgroundColor: badgeColor }]}
            >
              <Ionicons name={badgeIcon} size={9} color="#FFFFFF" />
            </View>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.titleRow}>
              <Text
                style={[
                  styles.title,
                  { color: isLocked ? theme.colors.textSecondary : theme.colors.text },
                ]}
                numberOfLines={1}
              >
                {achievement.title}
              </Text>
              {isClaimable && (
                <View style={styles.claimableBadge}>
                  <Text style={styles.claimableText}>Có thể nhận</Text>
                </View>
              )}
            </View>

            <Text
              style={[styles.description, { color: theme.colors.textSecondary }]}
              numberOfLines={2}
            >
              {achievement.description}
            </Text>

            {/* Progress bar (hiện khi chưa unlock hoặc đang claimable) */}
            {!achievement.isUnlocked && (
              <View style={styles.progressWrapper}>
                <View
                  style={[
                    styles.progressTrack,
                    { backgroundColor: `${theme.colors.border}40` },
                  ]}
                >
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: isClaimable ? "#FFD700" : theme.colors.neonGreen,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: theme.colors.textSecondary }]}>
                  {Math.round(progress)}%
                </Text>
              </View>
            )}

            {/* Ngày mở khóa */}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <View style={styles.unlockInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={theme.colors.success}
                />
                <Text style={[styles.unlockDate, { color: theme.colors.success }]}>
                  Mở khóa: {formatDate(achievement.unlockedAt)}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 12,
  },
  gradient: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    position: "relative",
  },
  statusBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#1A1A1A",
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  claimableBadge: {
    backgroundColor: "rgba(255,215,0,0.18)",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: "rgba(255,215,0,0.5)",
  },
  claimableText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FFD700",
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 32,
    textAlign: "right",
  },
  unlockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  unlockDate: {
    fontSize: 12,
    fontWeight: "600",
  },
});
