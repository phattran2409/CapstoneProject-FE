import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AchievementItem, Achievement } from "../components/AchievementItem";
import { BlurView } from "expo-blur";

type AchievementsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Achievements"
>;

type FilterType = "all" | "unlocked" | "locked";

// Mock data - Replace with API call later
const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    title: "Người mới bắt đầu",
    description: "Hoàn thành trận đấu đầu tiên",
    icon: "football",
    isUnlocked: true,
    unlockedAt: "2024-01-15T10:30:00Z",
    rarity: "common",
  },
  {
    id: "2",
    title: "Chiến thắng đầu tiên",
    description: "Giành chiến thắng trong trận đấu đầu tiên",
    icon: "trophy",
    isUnlocked: true,
    unlockedAt: "2024-01-20T14:20:00Z",
    rarity: "rare",
  },
  {
    id: "3",
    title: "Chuỗi thắng",
    description: "Thắng 5 trận liên tiếp",
    icon: "flame",
    isUnlocked: true,
    unlockedAt: "2024-02-01T18:45:00Z",
    rarity: "epic",
  },
  {
    id: "4",
    title: "Người chơi đáng tin cậy",
    description: "Đạt điểm uy tín 80+",
    icon: "shield-checkmark",
    isUnlocked: true,
    unlockedAt: "2024-02-05T09:15:00Z",
    rarity: "epic",
  },
  {
    id: "5",
    title: "Huyền thoại",
    description: "Đạt ELO 2000+",
    icon: "star",
    isUnlocked: false,
    progress: 65,
    rarity: "legendary",
  },
  {
    id: "6",
    title: "Người bạn tốt",
    description: "Có 50 bạn bè",
    icon: "people",
    isUnlocked: false,
    progress: 42,
    rarity: "rare",
  },
  {
    id: "7",
    title: "Tác giả nội dung",
    description: "Đăng 100 bài viết",
    icon: "create",
    isUnlocked: false,
    progress: 28,
    rarity: "rare",
  },
  {
    id: "8",
    title: "Vô địch",
    description: "Thắng 100 trận đấu",
    icon: "medal",
    isUnlocked: false,
    progress: 73,
    rarity: "epic",
  },
  {
    id: "9",
    title: "Người tổ chức",
    description: "Tạo 20 phòng đấu",
    icon: "calendar",
    isUnlocked: false,
    progress: 15,
    rarity: "common",
  },
  {
    id: "10",
    title: "Siêu sao",
    description: "Nhận 1000 lượt thích",
    icon: "heart",
    isUnlocked: false,
    progress: 55,
    rarity: "legendary",
  },
];

const AchievementsScreen: React.FC<AchievementsScreenProps> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  // Filter achievements
  const filteredAchievements = MOCK_ACHIEVEMENTS.filter((achievement) => {
    if (activeFilter === "unlocked") return achievement.isUnlocked;
    if (activeFilter === "locked") return !achievement.isUnlocked;
    return true;
  });

  // Calculate stats
  const totalAchievements = MOCK_ACHIEVEMENTS.length;
  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => a.isUnlocked).length;
  const completionRate = Math.round((unlockedCount / totalAchievements) * 100);

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
          Thành tựu
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
                Đã mở khóa
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
                Tổng số
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
                Hoàn thành
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
          {renderFilterButton("all", "Tất cả", "grid")}
          {renderFilterButton("unlocked", "Đã mở", "checkmark-circle")}
          {renderFilterButton("locked", "Bị khóa", "lock-closed")}
        </View>

        {/* Achievements List */}
        <View style={styles.achievementsContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {activeFilter === "all" && "Tất cả thành tựu"}
            {activeFilter === "unlocked" && "Thành tựu đã mở khóa"}
            {activeFilter === "locked" && "Thành tựu bị khóa"}
          </Text>
          <Text
            style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            {filteredAchievements.length} thành tựu
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
});

export default AchievementsScreen;
