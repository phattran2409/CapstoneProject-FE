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
  unlockedAt?: string;
  progress?: number; // 0-100 for locked achievements
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
  const isLocked = !achievement.isUnlocked;

  // Format unlock date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

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
            opacity: isLocked ? 0.5 : 1,
          },
        ]}
      >
        <LinearGradient
          colors={
            isLocked
              ? ["rgba(255,255,255,0.03)", "transparent"]
              : [`${rarityColor}20`, "transparent"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Icon Section */}
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: isLocked
                  ? `${theme.colors.border}20`
                  : `${rarityColor}30`,
              },
            ]}
          >
            <Ionicons
              name={achievement.icon}
              size={32}
              color={isLocked ? theme.colors.textSecondary : rarityColor}
            />
            {/* Lock badge for locked, check badge for unlocked */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: isLocked
                    ? "rgba(80,80,80,0.9)"
                    : theme.colors.success,
                },
              ]}
            >
              <Ionicons
                name={isLocked ? "lock-closed" : "checkmark"}
                size={9}
                color="#FFFFFF"
              />
            </View>
          </View>

          {/* Content Section */}
          <View style={styles.content}>
            <Text
              style={[
                styles.title,
                {
                  color: isLocked
                    ? theme.colors.textSecondary
                    : theme.colors.text,
                },
              ]}
              numberOfLines={1}
            >
              {achievement.title}
            </Text>
            <Text
              style={[
                styles.description,
                { color: theme.colors.textSecondary },
              ]}
              numberOfLines={2}
            >
              {achievement.description}
            </Text>

            {/* Unlock date for unlocked achievements */}
            {!isLocked && achievement.unlockedAt && (
              <View style={styles.unlockInfo}>
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color={theme.colors.success}
                />
                <Text
                  style={[styles.unlockDate, { color: theme.colors.success }]}
                >
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
  unlockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  unlockDate: {
    fontSize: 12,
    fontWeight: "600",
  },
});
