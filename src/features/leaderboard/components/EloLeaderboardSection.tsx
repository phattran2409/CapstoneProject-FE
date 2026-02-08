import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTheme } from "@/shared/theme";
import { ThemedText, ThemedView } from "@/shared/components/themed";

interface ELOPlayer {
  id: string;
  rank: number;
  name: string;
  username: string;
  avatar: any;
  elo: number;
  matchesPlayed: number;
  winRate: number;
  trend: "up" | "down" | "stable";
  eloChange: number;
}

// Mock ELO Leaderboard data
const topPlayers: ELOPlayer[] = [
  {
    id: "1",
    rank: 1,
    name: "Nguyễn Văn A",
    username: "nguyenvana",
    avatar: require("../../../../assets/icon.png"),
    elo: 2450,
    matchesPlayed: 128,
    winRate: 78.5,
    trend: "up",
    eloChange: 45,
  },
  {
    id: "2",
    rank: 2,
    name: "Trần Minh B",
    username: "tranminhb",
    avatar: require("../../../../assets/icon.png"),
    elo: 2380,
    matchesPlayed: 115,
    winRate: 74.2,
    trend: "up",
    eloChange: 28,
  },
  {
    id: "3",
    rank: 3,
    name: "Lê Hoàng C",
    username: "lehoangc",
    avatar: require("../../../../assets/icon.png"),
    elo: 2310,
    matchesPlayed: 102,
    winRate: 71.8,
    trend: "down",
    eloChange: -15,
  },
  {
    id: "4",
    rank: 4,
    name: "Phạm Đức D",
    username: "phamducd",
    avatar: require("../../../../assets/icon.png"),
    elo: 2285,
    matchesPlayed: 95,
    winRate: 69.5,
    trend: "stable",
    eloChange: 0,
  },
  {
    id: "5",
    rank: 5,
    name: "Võ Thành E",
    username: "vothanhe",
    avatar: require("../../../../assets/icon.png"),
    elo: 2240,
    matchesPlayed: 88,
    winRate: 67.3,
    trend: "up",
    eloChange: 12,
  },
];

export const EloLeaderboardSection: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#C0C0C0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return theme.colors.neonGreen;
    }
  };

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "trending-up";
      case "down":
        return "trending-down";
      case "stable":
        return "remove";
    }
  };

  const getTrendColor = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return "#22c55e";
      case "down":
        return "#ef4444";
      case "stable":
        return "#6b7280";
    }
  };

  return (
    <ThemedView
      style={[
        styles.leaderboardSection,
        {
          paddingVertical: theme.spacing.l,
          borderBottomWidth: 1,
          borderBottomColor: "#2a2a2a",
        },
      ]}
    >
      <View
        style={[
          styles.leaderboardHeader,
          {
            paddingHorizontal: theme.spacing.l,
            marginBottom: theme.spacing.m,
          },
        ]}
      >
        <View style={styles.leaderboardTitle}>
          <Ionicons name="trophy" size={24} color={theme.colors.neonGreen} />
          <ThemedText
            style={{ color: theme.colors.neonGreen, marginLeft: 8 }}
            variant="primary"
            size="xl"
            weight="bold"
          >
            {t("newsFeed.leaderboard")}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Leaderboard")}>
          <ThemedText variant="primary" size="s" weight="semiBold">
            {t("newsFeed.view")}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        data={topPlayers}
        keyExtractor={(player) => player.id}
        renderItem={({ item: player }) => {
          const rankColor = getRankColor(player.rank);
          return (
            <TouchableOpacity
              style={[
                styles.playerCard,
                {
                  backgroundColor: "#1a1a1a",
                  borderRadius: theme.radius.l,
                  padding: theme.spacing.m,
                  marginRight: theme.spacing.m,
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                  width: 180,
                },
              ]}
              onPress={() => {
                // Navigate to player profile
                // Assuming PersonalPage takes userId
                const parent = navigation.getParent();
                if (parent) {
                  parent.navigate("PersonalPage", { userId: player.id });
                } else {
                  navigation.navigate("PersonalPage", { userId: player.id });
                }
              }}
            >
              <View
                style={[
                  styles.rankBadge,
                  {
                    backgroundColor: rankColor + "20",
                    borderWidth: 2,
                    borderColor: rankColor,
                  },
                ]}
              >
                <Text style={[styles.rankText, { color: rankColor }]}>
                  #{player.rank}
                </Text>
              </View>

              <Image
                source={player.avatar}
                style={styles.playerAvatar}
                resizeMode="cover"
              />

              <Text
                style={[styles.playerName, { color: theme.colors.softWhite }]}
              >
                {player.name}
              </Text>
              <Text
                style={[
                  styles.playerUsername,
                  { color: theme.colors.textSecondary },
                ]}
              >
                @{player.username}
              </Text>

              <View
                style={[
                  styles.eloContainer,
                  {
                    backgroundColor: "#0a0a0a",
                    borderRadius: theme.radius.m,
                    padding: 12,
                    marginBottom: 8,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.eloLabel,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  ELO Rating
                </Text>
                <Text
                  style={[styles.eloValue, { color: theme.colors.neonGreen }]}
                >
                  {player.elo}
                </Text>

                <View style={styles.trendContainer}>
                  <Ionicons
                    name={getTrendIcon(player.trend)}
                    size={14}
                    color={getTrendColor(player.trend)}
                  />
                  <Text
                    style={[
                      styles.trendText,
                      { color: getTrendColor(player.trend) },
                    ]}
                  >
                    {player.eloChange > 0 ? "+" : ""}
                    {player.eloChange}
                  </Text>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Matches
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.colors.softWhite },
                    ]}
                  >
                    {player.matchesPlayed}
                  </Text>
                </View>
                <View
                  style={[styles.statDivider, { backgroundColor: "#2a2a2a" }]}
                />
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    Win Rate
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.colors.softWhite },
                    ]}
                  >
                    {player.winRate}%
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  leaderboardSection: {},
  leaderboardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leaderboardTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  playerCard: {
    position: "relative",
  },
  rankBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 12,
    fontWeight: "700",
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignSelf: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  playerUsername: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 12,
  },
  eloContainer: {},
  eloLabel: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  eloValue: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  trendText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
  },
});
