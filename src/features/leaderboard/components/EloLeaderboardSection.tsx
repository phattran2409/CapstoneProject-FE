import React, { useMemo } from "react";
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
import { Leaderboard } from "../types/leaderboard.types";
import { getEmailUsername } from "@/shared/utils/formatters";

interface EloLeaderboardSectionProps {
  users: Leaderboard[];
  loading?: boolean;
  error?: unknown;
}

export const EloLeaderboardSection: React.FC<EloLeaderboardSectionProps> = ({ users, loading, error }) => {
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

  const data = useMemo(() => users ?? [], [users]);

  if (loading && !data.length) {
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
        </View>
      </ThemedView>
    );
  }

  if (!!error && !data.length) {
    return null;
  }

  if (!data.length) {
    return null;
  }

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
        data={data}
        keyExtractor={(player) => player.userId}
        renderItem={({ item: player, index }) => {
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
                  parent.navigate("PersonalPage", { userId: player.userId });
                } else {
                  navigation.navigate("PersonalPage", { userId: player.userId });
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
                source={player.avatarUrl ? { uri: player.avatarUrl } : require('../../../assets/images/default_avatar.png')}
                style={styles.playerAvatar}
                resizeMode="cover"
              />

              <Text
                style={[styles.playerName, { color: theme.colors.softWhite }]}
              >
                {player.fullName}
              </Text>
              <Text
                style={[
                  styles.playerUsername,
                  { color: theme.colors.textSecondary },
                ]}
              >
                  @{getEmailUsername(player.email)}
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
                  {t('leaderboard.stats.eloRating')}
                </Text>
                <Text
                  style={[styles.eloValue, { color: theme.colors.neonGreen }]}
                >
                  {player.currentElo}
                </Text>
                {!!player.eloChange && (
                  <View style={styles.trendContainer}>
                    <Ionicons
                      name={player.eloChange > 0 ? "trending-up" : "trending-down"}
                      size={14}
                      color={player.eloChange > 0 ? theme.colors.success : theme.colors.error}
                    />
                    <Text
                      style={[
                        styles.trendText,
                        {
                          color:
                            player.eloChange > 0
                              ? theme.colors.success
                              : theme.colors.error,
                        },
                      ]}
                    >
                      {player.eloChange > 0 ? `+${player.eloChange}` : player.eloChange}
                    </Text>
                  </View>
                )}
           
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text
                    style={[
                      styles.statLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {t('leaderboard.stats.matches')}
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.colors.softWhite },
                    ]}
                  >
                    {player.totalMatches}
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
