import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { useAuthStore } from "@/features/auth/store/authStore";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { RouteProp } from "@react-navigation/native";
import { TrustScoreCard } from "../components/TrustScoreCard";

type ProfileDetailScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ProfileDetail"
>;

interface ProfileDetailScreenProps {
  navigation: ProfileDetailScreenNavigationProp;
  route: RouteProp<RootStackParamList, "ProfileDetail">;
}

interface InfoRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  iconColor?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, iconColor }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.infoRow, { borderBottomColor: theme.colors.border }]}>
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: `${iconColor || theme.colors.neonGreen}15` },
        ]}
      >
        <Ionicons
          name={icon}
          size={20}
          color={iconColor || theme.colors.neonGreen}
        />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
        <Text style={[styles.infoValue, { color: theme.colors.text }]}>
          {value}
        </Text>
      </View>
    </View>
  );
};

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number | string;
  label: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color }) => {
  const { theme } = useTheme();

  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={[styles.statCard, { borderRadius: theme.radius.m }]}
    >
      <LinearGradient
        colors={[`${color}20`, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.statGradient}
      >
        <Ionicons name={icon} size={24} color={color} />
        <Text style={[styles.statValue, { color: theme.colors.text }]}>
          {value}
        </Text>
        <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      </LinearGradient>
    </BlurView>
  );
};

const ProfileDetailScreen: React.FC<ProfileDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const { t } = useTranslation();

  // Get player data from route params
  const player = route.params.player;
  const playerProfile = player.playerProfile;

  // Calculate win rate
  const totalMatches = playerProfile?.totalMatches || 0;
  const wins = playerProfile?.wins || 0;
  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;

  // Format date of birth
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  // Format gender (0 = Male, 1 = Female, 2 = Other)
  const formatGender = (gender: number | null) => {
    if (gender === null || gender === undefined) return "N/A";
    switch (gender) {
      case 0:
        return "Nam";
      case 1:
        return "Nữ";
      case 2:
        return "Khác";
      default:
        return "N/A";
    }
  };

  // Format preferred foot
  const formatPreferredFoot = (foot: string | null) => {
    if (!foot) return "N/A";
    return foot === "left"
      ? "Chân trái"
      : foot === "right"
        ? "Chân phải"
        : foot;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {t("profileDetail.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trust Score Section */}
        <View style={styles.section}>
          <TrustScoreCard score={85} variant="detailed" />
        </View>

        {/* Stats Overview */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
          >
            {t("profileDetail.stats")}
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="football"
              value={totalMatches}
              label={t("profileDetail.matchCount")}
              color={theme.colors.neonGreen}
            />
            <StatCard
              icon="trending-up"
              value={`${winRate}%`}
              label={t("profileDetail.winRate")}
              color="#FFD700"
            />
            <StatCard
              icon="trophy"
              value={playerProfile?.currentElo || 0}
              label={t("profileDetail.elo")}
              color="#00E5FF"
            />
            <StatCard
              icon="podium"
              value="N/A"
              label={t("profileDetail.rank")}
              color="#FF6B6B"
            />
          </View>
        </View>

        {/* Match Stats */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
          >
            {t("profileDetail.matchStats")}
          </Text>
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.matchStatsCard, { borderRadius: theme.radius.l }]}
          >
            <View style={styles.matchStatRow}>
              <View style={styles.matchStat}>
                <Text
                  style={[
                    styles.matchStatValue,
                    { color: theme.colors.success },
                  ]}
                >
                  {playerProfile?.wins || 0}
                </Text>
                <Text
                  style={[
                    styles.matchStatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("profileDetail.win")}
                </Text>
              </View>
              <View
                style={[
                  styles.matchStatDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View style={styles.matchStat}>
                <Text
                  style={[
                    styles.matchStatValue,
                    { color: theme.colors.warning },
                  ]}
                >
                  {playerProfile?.draws || 0}
                </Text>
                <Text
                  style={[
                    styles.matchStatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("profileDetail.draw")}
                </Text>
              </View>
              <View
                style={[
                  styles.matchStatDivider,
                  { backgroundColor: theme.colors.border },
                ]}
              />
              <View style={styles.matchStat}>
                <Text
                  style={[styles.matchStatValue, { color: theme.colors.error }]}
                >
                  {playerProfile?.losses || 0}
                </Text>
                <Text
                  style={[
                    styles.matchStatLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {t("profileDetail.lose")}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
          >
            {t("profileDetail.personalInfo", {
              defaultValue: "Thông tin cá nhân",
            })}
          </Text>
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.infoCard, { borderRadius: theme.radius.l }]}
          >
            <InfoRow
              icon="person"
              label={t("profileDetail.personInfo.name")}
              value={player.fullName}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="mail"
              label={t("profileDetail.personInfo.email")}
              value={player.email}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="call"
              label={t("profileDetail.personInfo.phone") + " (+84)"}
              value={player.phone || "N/A"}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="calendar"
              label={t("profileDetail.personInfo.dateOfBirth")}
              value={formatDate(player.dateOfBirth)}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="male-female"
              label={t("profileDetail.personInfo.gender")}
              value={formatGender(player.gender)}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="time"
              label={t("profileDetail.personInfo.joinDate")}
              value={formatDate(player.createdAt)}
              iconColor="#607D8B"
            />
          </BlurView>
        </View>

        {/* Football Info */}
        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.neonGreen }]}
          >
            {t("profileDetail.footballInfo")}
          </Text>
          <BlurView
            intensity={30}
            tint="dark"
            style={[styles.infoCard, { borderRadius: theme.radius.l }]}
          >
            <InfoRow
              icon="football"
              label={t("profileDetail.footInfo.position")}
              value={player.preferredPositions || "N/A"}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="shirt"
              label={t("profileDetail.footInfo.shirtNumber")}
              value={player.shirtNumber?.toString() || "N/A"}
              iconColor="#607D8B"
            />
            <InfoRow
              icon="footsteps"
              label={t("profileDetail.footInfo.preferredFoot")}
              value={formatPreferredFoot(player.preferredFoot)}
              iconColor="#607D8B"
            />
          </BlurView>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}
            onPress={() => {
              /* TODO: Share profile */
            }}
          >
            <Ionicons
              name="share-social"
              size={20}
              color={theme.colors.neonGreen}
            />
            <Text
              style={[styles.actionButtonText, { color: theme.colors.text }]}
            >
              {t("profileDetail.shareProfile", {
                defaultValue: "Chia sẻ hồ sơ",
              })}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: `${theme.colors.error}15`,
                borderColor: theme.colors.error,
              },
            ]}
            onPress={() => {
              /* Report issue */
            }}
          >
            <Ionicons name="warning" size={20} color={theme.colors.error} />
            <Text
              style={[styles.actionButtonText, { color: theme.colors.error }]}
            >
              {t("profileDetail.reportIssue", {
                defaultValue: "Báo cáo vấn đề",
              })}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statGradient: {
    padding: 16,
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  matchStatsCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
  },
  matchStatRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  matchStat: {
    alignItems: "center",
    flex: 1,
  },
  matchStatValue: {
    fontSize: 28,
    fontWeight: "800",
  },
  matchStatLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 4,
  },
  matchStatDivider: {
    width: 1,
    height: 40,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  infoCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ProfileDetailScreen;
