import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";

interface TrustScoreCardProps {
  score: number; // 0-100
  variant?: "compact" | "detailed";
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({
  score,
  variant = "compact",
}) => {
  const { theme } = useTheme();

  // Determine color based on score
  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#00E676"; // Excellent - Green
    if (score >= 60) return "#FFD700"; // Good - Gold
    if (score >= 40) return "#FFA726"; // Fair - Orange
    return "#FF5252"; // Poor - Red
  };

  // Get trust level label
  const getTrustLevel = (score: number): string => {
    if (score >= 80) return "Xuất sắc";
    if (score >= 60) return "Tốt";
    if (score >= 40) return "Trung bình";
    return "Cần cải thiện";
  };

  const scoreColor = getScoreColor(score);
  const trustLevel = getTrustLevel(score);

  if (variant === "compact") {
    return (
      <BlurView
        intensity={40}
        tint="dark"
        style={[styles.compactContainer, { borderRadius: theme.radius.m }]}
      >
        <LinearGradient
          colors={[`${scoreColor}20`, "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.compactGradient}
        >
          <View style={styles.compactHeader}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: `${scoreColor}20` },
              ]}
            >
              <Ionicons name="shield-checkmark" size={20} color={scoreColor} />
            </View>
            <Text
              style={[
                styles.compactLabel,
                { color: theme.colors.textSecondary },
              ]}
            >
              Điểm uy tín
            </Text>
          </View>
          <View style={styles.compactScoreRow}>
            <Text style={[styles.compactScore, { color: scoreColor }]}>
              {score}
            </Text>
            <Text
              style={[
                styles.compactMaxScore,
                { color: theme.colors.textSecondary },
              ]}
            >
              /100
            </Text>
          </View>
          <Text style={[styles.compactLevel, { color: scoreColor }]}>
            {trustLevel}
          </Text>
        </LinearGradient>
      </BlurView>
    );
  }

  // Detailed variant
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[styles.detailedContainer, { borderRadius: theme.radius.l }]}
    >
      <LinearGradient
        colors={[`${scoreColor}15`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.detailedGradient}
      >
        {/* Header */}
        <View style={styles.detailedHeader}>
          <View
            style={[
              styles.detailedIconWrapper,
              { backgroundColor: `${scoreColor}20` },
            ]}
          >
            <Ionicons name="shield-checkmark" size={32} color={scoreColor} />
          </View>
          <View style={styles.detailedHeaderText}>
            <Text style={[styles.detailedTitle, { color: theme.colors.text }]}>
              Điểm uy tín
            </Text>

          </View>
        </View>

        {/* Score Display */}
        <View style={styles.scoreDisplay}>
          <Text style={[styles.detailedScore, { color: scoreColor }]}>
            {score}
          </Text>
          <Text
            style={[
              styles.detailedMaxScore,
              { color: theme.colors.textSecondary },
            ]}
          >
            /100
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={[
            styles.progressBarContainer,
            { backgroundColor: `${scoreColor}20` },
          ]}
        >
          <LinearGradient
            colors={[scoreColor, `${scoreColor}CC`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.progressBarFill, { width: `${score}%` }]}
          />
        </View>

        {/* Level Badge */}
        <View
          style={[styles.levelBadge, { backgroundColor: `${scoreColor}20` }]}
        >
          <Ionicons name="star" size={16} color={scoreColor} />
          <Text style={[styles.levelText, { color: scoreColor }]}>
            {trustLevel}
          </Text>
        </View>

        {/* Info Text */}
        <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
          Điểm uy tín được tính dựa trên lịch sử tham gia, đánh giá từ người
          chơi khác và hành vi trong trận đấu
        </Text>
      </LinearGradient>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  // Compact variant styles
  compactContainer: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  compactGradient: {
    padding: 16,
  },
  compactHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  compactScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  compactScore: {
    fontSize: 36,
    fontWeight: "800",
    lineHeight: 40,
  },
  compactMaxScore: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 4,
  },
  compactLevel: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Detailed variant styles
  detailedContainer: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  detailedGradient: {
    padding: 20,
  },
  detailedHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  detailedIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailedHeaderText: {
    flex: 1,
  },
  detailedTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 2,
  },
  detailedSubtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    marginBottom: 16,
  },
  detailedScore: {
    fontSize: 56,
    fontWeight: "800",
    lineHeight: 60,
  },
  detailedMaxScore: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
    gap: 6,
  },
  levelText: {
    fontSize: 14,
    fontWeight: "700",
  },
  infoText: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 18,
    textAlign: "center",
  },
});
