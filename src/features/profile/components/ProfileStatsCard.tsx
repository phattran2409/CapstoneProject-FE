import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { RankBadge, getRankInfoFromElo } from "@/shared/components/RankBadge";
import { JerseyBadge } from "./JerseyBadge";
import { useTranslation } from "react-i18next";

interface ProfileStatsCardProps {
  trustScore: number; // 0-100
  elo: number;
  shirtNumber?: number;
  position?: string;
  onAchievementsPress: () => void;
}

export const ProfileStatsCard: React.FC<ProfileStatsCardProps> = ({
  trustScore,
  elo,
  shirtNumber,
  position,
  onAchievementsPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const rankInfo = getRankInfoFromElo(elo, theme.colors.neonGreen);

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[styles.container, { borderRadius: theme.radius.m }]}
    >
      <LinearGradient
        colors={[`${theme.colors.neonGreen}20`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Row 1: Trust Score Header */}
        <View style={styles.row1}>
          <View style={styles.trustHeader}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${theme.colors.neonGreen}20` },
              ]}
            >
              <Ionicons
                name="shield-checkmark"
                size={18}
                color={theme.colors.neonGreen}
              />
            </View>
            <Text
              style={[styles.trustLabel, { color: theme.colors.secondary }]}
            >
              Điểm uy tín
            </Text>
          </View>
          <Text style={styles.trustScoreContainer}>
            <Text
              style={[
                styles.trustScoreValue,
                { color: theme.colors.neonGreen },
              ]}
            >
              {trustScore}
            </Text>
            <Text
              style={[
                styles.trustScoreMax,
                { color: theme.colors.textSecondary },
              ]}
            >
              /100
            </Text>
          </Text>
        </View>

        {/* Row 2: Rank Info & Jersey/Position */}
        <View style={styles.row2}>
          {/* Left: Rank Level Text */}
          <View style={styles.rankTextContainer}>
            <Text
              style={[styles.rankLabel, { color: theme.colors.textSecondary }]}
            >
              Hạng hiện tại
            </Text>
            <Text
              style={[
                styles.rankLevel,
                {
                  color: rankInfo.color,
                  textShadowColor: `${rankInfo.color}60`,
                  textShadowOffset: { width: 0, height: 0 },
                  textShadowRadius: 8,
                },
              ]}
            >
              {t(`rank.tiers.${rankInfo.tier}`, {
                defaultValue: rankInfo.label,
              })}
            </Text>
          </View>
          {shirtNumber && position && (
            <View style={{ paddingRight: 30 }}>
              <JerseyBadge
                number={shirtNumber}
                accent={theme.colors.neonGreen}
                text={position}
              />
            </View>
          )}

          {/* Right: Rank Badge with ELO */}
          <View style={styles.rankBadgeContainer}>
            <RankBadge
              elo={elo}
              size="large"
              showElo
              transparent
              showLabel={false}
              eloColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Row 3: Achievements Button */}
        <TouchableOpacity
          onPress={onAchievementsPress}
          style={[
            styles.achievementsButton,
            {
              backgroundColor: `${theme.colors.neonGreen}15`,
              borderColor: theme.colors.neonGreen,
            },
          ]}
          activeOpacity={0.7}
        >
          <View style={styles.achievementsContent}>
            <View
              style={[
                styles.achievementsIcon,
                { backgroundColor: `${theme.colors.neonGreen}30` },
              ]}
            >
              <Ionicons
                name="trophy"
                size={20}
                color={theme.colors.neonGreen}
              />
            </View>
            <View style={styles.achievementsText}>
              <Text
                style={[styles.achievementsTitle, { color: theme.colors.text }]}
              >
                Thành tựu
              </Text>
              <Text
                style={[
                  styles.achievementsSubtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Xem tất cả thành tựu
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.neonGreen}
          />
        </TouchableOpacity>
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  // Container - matching ProfileDetailScreen StatCard
  container: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  // Gradient wrapper - matching ProfileDetailScreen
  gradient: {
    padding: 16,
    gap: 16,
  },

  // Row 1: Trust Score Header
  row1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  trustHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  trustLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  trustScoreContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 2,
  },
  trustScoreValue: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 28,
  },
  trustScoreMax: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 28,
  },

  // Row 2: Rank Info
  row2: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  rankTextContainer: {
    flex: 1,
  },
  rankLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  rankLevel: {
    fontSize: 22,
    fontWeight: "800",
    fontStyle: "italic",
    letterSpacing: 1,
  },
  rankBadgeContainer: {
    alignItems: "center",
  },

  // Jersey Row
  jerseyRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },

  // Row 3: Achievements Button
  achievementsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  achievementsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  achievementsIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  achievementsText: {
    flex: 1,
  },
  achievementsTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 2,
  },
  achievementsSubtitle: {
    fontSize: 12,
    fontWeight: "500",
  },
});
