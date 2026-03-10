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
import { Players } from "../types/leaderboard.types";
import { getEmailUsername } from "@/shared/utils/formatters";

interface EloLeaderboardSectionProps {
  users: Players[];
}

export const EloLeaderboardSection: React.FC<EloLeaderboardSectionProps> = ({ users }) => {
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
        data={users}
        keyExtractor={(player) => player.userId}
        renderItem={({ item: player, index }) => {
          const rankColor = getRankColor(index + 1);
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
                  #{index + 1}
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
                  {player.playerProfile?.currentElo}
                </Text>

           
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
                    {player.playerProfile?.totalMatches}
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
                    {t('leaderboard.stats.winRate')}
                  </Text>
                  <Text
                    style={[
                      styles.statValue,
                      { color: theme.colors.softWhite },
                    ]}
                  >
                    {(
                      ((player.playerProfile?.wins ?? 0) /
                        (player.playerProfile?.totalMatches || 1)) *
                      100
                    ).toFixed(2)}%
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
