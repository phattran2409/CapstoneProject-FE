import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Friend } from '../types/friends.types';
import { getRelativeTime } from '@/shared/utils';

export const FriendCard: React.FC<{
    friend: Friend;
    onPress?: () => void;
    onMessagePress?: () => void;
    onInvitePress?: () => void;
  }> = ({ friend, onPress, onMessagePress, onInvitePress }) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
  
    const getRankColor = (elo: number) => {
      if (elo >= 3000) return '#FFD700'; // Gold
      if (elo >= 2500) return '#C0C0C0'; // Silver
      if (elo >= 2000) return '#CD7F32'; // Bronze
      return theme.colors.neonGreen;
    };

    // Adjust gradient colors based on theme
    const gradientColors: [string, string] = isDark
      ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']
      : ['rgba(255,255,255,0.95)', 'rgba(255,255,255,0.90)'];

  
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <BlurView
          intensity={isDark ? 40 : 80}
          tint={isDark ? "dark" : "light"}
          style={[
            styles.friendCard,
            {
              borderRadius: theme.radius.l,
              backgroundColor: isDark ? "transparent" : theme.colors.surface,
              shadowColor: isDark ? undefined : theme.colors.shadow,
              shadowOffset: isDark ? undefined : { width: 0, height: 2 },
              shadowOpacity: isDark ? undefined : 0.1,
              shadowRadius: isDark ? undefined : 4,
              elevation: isDark ? 0 : 2,
            },
          ]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardGradient}
          >
            {/* Avatar with online indicator */}
            <View style={styles.avatarContainer}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: theme.colors.surface,
                    borderColor: getRankColor(friend.currentElo),
                  },
                ]}
              >
                {friend.avatarUrl ? (
                  <Image
                    source={{ uri: friend.avatarUrl }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Image
                    source={require("../../../assets/images/default_avatar.png")}
                    style={styles.avatarImage}
                  />
                )}
              </View>
            </View>

            {/* Friend info */}
            <View style={styles.friendInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[styles.friendName, { color: theme.colors.text }]}
                  numberOfLines={1}
                >
                  {friend.fullName}
                </Text>
                {friend.currentElo >= 2500 && (
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={theme.colors.neonGreen}
                    style={{ marginLeft: 4 }}
                  />
                )}
              </View>

              <View style={styles.statsRow}>
                <View
                  style={[
                    styles.eloBadge,
                    {
                      backgroundColor: isDark
                        ? `${getRankColor(friend.currentElo)}20`
                        : `${getRankColor(friend.currentElo)}15`,
                    },
                  ]}
                >
                  <Ionicons
                    name="trophy"
                    size={12}
                    color={getRankColor(friend.currentElo)}
                  />
                  <Text
                    style={[
                      styles.eloText,
                      { color: getRankColor(friend.currentElo) },
                    ]}
                  >
                    {friend.currentElo}
                  </Text>
                </View>
                {friend.preferredPositions && (
                  <View
                    style={[
                      styles.positionBadge,
                      {
                        backgroundColor: isDark
                          ? `${theme.colors.neonGreen}15`
                          : `${theme.colors.neonGreen}10`,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.positionText,
                        { color: theme.colors.neonGreen },
                      ]}
                    >
                      {friend.preferredPositions}
                    </Text>
                  </View>
                )}
              </View>
              <Text
                style={[styles.sentAt, { color: theme.colors.textTertiary }]}
              >
                Bạn bè kể từ - {getRelativeTime(friend.friendsSince)}
              </Text>
            </View>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={onMessagePress}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isDark
                      ? `${theme.colors.neonGreen}20`
                      : `${theme.colors.neonGreen}15`,
                  },
                ]}
              >
                <Ionicons
                  name="chatbubble"
                  size={18}
                  color={theme.colors.neonGreen}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onInvitePress}
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: isDark
                      ? `${theme.colors.info}20`
                      : `${theme.colors.info}15`,
                  },
                ]}
              >
                <Ionicons name="football" size={18} color={theme.colors.info} />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Border glow */}
          <View
            style={[styles.cardBorder, { borderColor: theme.colors.neonGreen }]}
          />
        </BlurView>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 16,
    },
    friendCard: {
      overflow: "hidden",
      position: "relative",
    },
    cardGradient: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
    },
    avatarContainer: {
      position: "relative",
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
      overflow: "hidden",
    },
    avatarImage: {
      width: "100%",
      height: "100%",
    },
    friendInfo: {
      flex: 1,
      marginLeft: 12,
    },
    nameRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    friendName: {
      fontSize: 16,
      fontWeight: "700",
      maxWidth: "80%",
    },
    username: {
      fontSize: 13,
      marginTop: 2,
    },
    statsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 8,
    },
    eloBadge: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    eloText: {
      fontSize: 12,
      fontWeight: "700",
    },
    positionBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    positionText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    mutualFriends: {
      fontSize: 12,
      marginTop: 6,
    },
    actionButtons: {
      flexDirection: "column",
      gap: 8,
    },
    actionBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    cardBorder: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: 16,
      borderWidth: 1,
      pointerEvents: "none",
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 48,
    },
    emptyIconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    sentAt: {
      fontSize: 11,
      marginTop: 4,
    },
  });
  
  