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
import { FriendRequest } from '../types/friends.types';

export interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept: () => void;
  onDecline: () => void;
  onPress?: () => void;
}

export const FriendRequestCard: React.FC<FriendRequestCardProps> = ({
  request,
  onAccept,
  onDecline,
  onPress,
}) => {
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

  // Border color based on theme
  const borderColor = isDark
    ? `${theme.colors.neonGreen}30`
    : `${theme.colors.neonGreen}40`;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurView 
        intensity={isDark ? 40 : 80} 
        tint={isDark ? "dark" : "light"} 
        style={[
          styles.card, 
          { 
            borderRadius: theme.radius.l,
            backgroundColor: isDark ? 'transparent' : theme.colors.surface,
            shadowColor: isDark ? undefined : theme.colors.shadow,
            shadowOffset: isDark ? undefined : { width: 0, height: 2 },
            shadowOpacity: isDark ? undefined : 0.1,
            shadowRadius: isDark ? undefined : 4,
            elevation: isDark ? 0 : 2,
          }
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: getRankColor(request.elo),
                },
              ]}
            >
              {request.avatar ? (
                <Image source={{ uri: request.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={28} color={theme.colors.textSecondary} />
              )}
            </View>
          </View>

          {/* Request info */}
          <View style={styles.requestInfo}>
            <View style={styles.nameRow}>
              <Text style={[styles.requestName, { color: theme.colors.text }]} numberOfLines={1}>
                {request.name}
              </Text>
              {request.elo >= 2500 && (
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.neonGreen} style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={[styles.username, { color: theme.colors.textSecondary }]}>@{request.username}</Text>

            <View style={styles.statsRow}>
              <View style={[
                styles.eloBadge, 
                { backgroundColor: isDark ? `${getRankColor(request.elo)}20` : `${getRankColor(request.elo)}15` }
              ]}>
                <Ionicons name="trophy" size={12} color={getRankColor(request.elo)} />
                <Text style={[styles.eloText, { color: getRankColor(request.elo) }]}>{request.elo}</Text>
              </View>
              {request.position && (
                <View style={[
                  styles.positionBadge, 
                  { backgroundColor: isDark ? `${theme.colors.neonGreen}15` : `${theme.colors.neonGreen}10` }
                ]}>
                  <Text style={[styles.positionText, { color: theme.colors.neonGreen }]}>{request.position}</Text>
                </View>
              )}
            </View>

            {request.mutualFriends && request.mutualFriends > 0 && (
              <Text style={[styles.mutualFriends, { color: theme.colors.textSecondary }]}>
                <Ionicons name="people" size={12} color={theme.colors.textSecondary} />{' '}
                {t('friends.mutualFriends', { count: request.mutualFriends, defaultValue: `${request.mutualFriends} bạn chung` })}
              </Text>
            )}

            <Text style={[styles.sentAt, { color: theme.colors.textTertiary }]}>
              {request.sentAt}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={onAccept}
              style={[styles.acceptButton, { backgroundColor: theme.colors.neonGreen }]}
            >
              <Ionicons name="checkmark" size={20} color={theme.colors.background} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onDecline}
              style={[styles.declineButton, { backgroundColor: theme.colors.error }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Border glow */}
        <View
          style={[
            styles.cardBorder,
            { borderColor },
          ]}
        />
      </BlurView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    position: 'relative',
  },
  cardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requestName: {
    fontSize: 16,
    fontWeight: '700',
    maxWidth: '80%',
  },
  username: {
    fontSize: 13,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  eloBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  eloText: {
    fontSize: 12,
    fontWeight: '700',
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  positionText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mutualFriends: {
    fontSize: 12,
    marginTop: 6,
  },
  sentAt: {
    fontSize: 11,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});

