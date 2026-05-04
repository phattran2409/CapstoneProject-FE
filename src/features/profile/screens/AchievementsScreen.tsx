import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AchievementItem, Achievement } from "../components/AchievementItem";
import { BlurView } from "expo-blur";
import { useAchievements } from "../hooks/useProfile";
import { AchievementItem as AchievementItemType } from "../types/profile.types";
import { getAchievementTranslation } from "../constants/achievementTranslations";
import { useAppStore } from "@/store/appStore";

type AchievementsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Achievements"
>;

type FilterType = "all" | "unlocked" | "locked";

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const appLanguage = useAppStore((s) => s.language);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const { data: rawData, isLoading, isError } = useAchievements();

  /** Map cục bộ + khớp phụ theo tên EN — không phụ thuộc i18n key động (UUID) */
  const achievements: Achievement[] = useMemo(() => {
    const langTag =
      [i18n.resolvedLanguage, i18n.language, appLanguage].find(
        (x) => x != null && String(x).length > 0,
      ) ?? "vi";
    return (rawData?.achievements ?? []).map((item: AchievementItemType) => {
      const { name, description } = getAchievementTranslation(
        item.achievementId,
        langTag,
        item.name,
        item.description,
      );
      return {
        id: item.achievementId,
        title: name,
        description,
        icon: "trophy" as keyof typeof Ionicons.glyphMap,
        isUnlocked: item.isUnlocked,
        status: item.status,
        unlockedAt: item.earnedAt ?? undefined,
        progress: item.progressPercent,
      };
    });
  }, [
    rawData?.achievements,
    i18n.resolvedLanguage,
    i18n.language,
    appLanguage,
  ]);

  // "unlocked" bao gồm cả Claimable (đã đủ điều kiện, chưa claim)
  const filteredAchievements = achievements.filter((achievement) => {
    if (activeFilter === "unlocked")
      return achievement.isUnlocked || achievement.status === "Claimable";
    if (activeFilter === "locked")
      return !achievement.isUnlocked && achievement.status !== "Claimable";
    return true;
  });

  // Tính stats: Claimable tính vào unlocked để hiển thị chính xác
  const totalAchievements = rawData?.totalAchievements ?? achievements.length;
  const unlockedCount =
    rawData?.unlockedCount ??
    achievements.filter(
      (a) => a.isUnlocked || a.status === "Claimable",
    ).length;
  const completionRate =
    totalAchievements > 0
      ? Math.round((unlockedCount / totalAchievements) * 100)
      : 0;

  const handleAchievementPress = (achievement: Achievement) => {
    // TODO: Show achievement detail modal
    console.log("Achievement pressed:", achievement.title);
  };

  const renderFilterButton = (
    filter: FilterType,
    label: string,
    icon: keyof typeof Ionicons.glyphMap,
  ) => {
    const isActive = activeFilter === filter;
    return (
      <TouchableOpacity
        onPress={() => setActiveFilter(filter)}
        style={[
          styles.filterButton,
          {
            backgroundColor: isActive
              ? `${theme.colors.neonGreen}20`
              : theme.colors.surface,
            borderColor: isActive
              ? theme.colors.neonGreen
              : theme.colors.border,
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={isActive ? theme.colors.neonGreen : theme.colors.textSecondary}
        />
        <Text
          style={[
            styles.filterText,
            {
              color: isActive
                ? theme.colors.neonGreen
                : theme.colors.textSecondary,
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("achievements.title")}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.colors.neonGreen} />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            {t("achievements.loading")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View
          style={[styles.header, { borderBottomColor: theme.colors.border }]}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {t("achievements.title")}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={theme.colors.error}
          />
          <Text
            style={[styles.loadingText, { color: theme.colors.textSecondary }]}
          >
            {t("achievements.error")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {t("achievements.title")}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Overview */}
        <BlurView
          intensity={40}
          tint="dark"
          style={[styles.statsCard, { borderRadius: theme.radius.l }]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text
                style={[styles.statValue, { color: theme.colors.neonGreen }]}
              >
                {unlockedCount}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("achievements.stats.unlocked")}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {totalAchievements}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("achievements.stats.total")}
              </Text>
            </View>
            <View
              style={[
                styles.statDivider,
                { backgroundColor: theme.colors.border },
              ]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: "#FFD700" }]}>
                {completionRate}%
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {t("achievements.stats.completion")}
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: `${theme.colors.neonGreen}20` },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${completionRate}%`,
                    backgroundColor: theme.colors.neonGreen,
                  },
                ]}
              />
            </View>
          </View>
        </BlurView>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          {renderFilterButton("all", t("achievements.filter.all"), "grid")}
          {renderFilterButton(
            "unlocked",
            t("achievements.filter.unlocked"),
            "checkmark-circle",
          )}
          {renderFilterButton(
            "locked",
            t("achievements.filter.locked"),
            "lock-closed",
          )}
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {activeFilter === "all" && t("achievements.section.all")}
            {activeFilter === "unlocked" && t("achievements.section.unlocked")}
            {activeFilter === "locked" && t("achievements.section.locked")}
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t("achievements.section.count", {
              count: filteredAchievements.length,
            })}
          </Text>

          {filteredAchievements.map((achievement) => (
            <AchievementItem
              key={achievement.id}
              achievement={achievement}
              onPress={handleAchievementPress}
            />
          ))}
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
  statsCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    padding: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  achievementsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 8,
  },
});

export default AchievementsScreen;
