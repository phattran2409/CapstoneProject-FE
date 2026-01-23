import React, { useRef } from 'react';
import { View, TouchableOpacity, Image, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { ThemedText, ThemedIcon } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { Player } from '../types/room.types';

interface PlayerCardProps {
  player: Player | null;
  teamId: string;
  teamColor: string;
  isHost: boolean;
  currentUserId?: string;
  isJoining?: boolean;
  isKicking?: boolean;
  onJoinTeam: (teamId: string) => void;
  onKickPlayer: (userId: string, playerName: string) => void;
  onPress?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  teamId,
  teamColor,
  isHost,
  currentUserId,
  isJoining = false,
  isKicking = false,
  onJoinTeam,
  onKickPlayer,
  onPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 8,
    }).start();
  };

  // Empty slot - Interactive add button
  if (!player) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => onJoinTeam(teamId)}
          disabled={isJoining}
        >
          <View
            style={[
              styles.emptySlotCard,
              { 
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface + '80',
                opacity: isJoining ? 0.5 : 1,
              }
            ]}
          >
            <View 
              style={[
                styles.emptySlotIconContainer,
                { backgroundColor: theme.colors.neonGreen + '20' }
              ]}
            >
              <ThemedIcon name={isJoining ? "hourglass" : "add"} size={32} variant="accent" />
            </View>
            <ThemedText variant="secondary" size="s" weight="medium">
              {isJoining ? 'Joining...' : t('roomDetail.emptySlot')}
            </ThemedText>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Player card with beautiful background and effects
  const canKick = isHost && !player.isConfirmed && player.userId !== currentUserId;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <View
          style={[
            styles.playerCard,
            { 
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              shadowColor: teamColor,
            }
          ]}
        >
          {/* Gradient Background Effect */}
          <View 
            style={[
              styles.playerCardGradient,
              { backgroundColor: teamColor + '15' }
            ]}
          />
          
          {/* Kick Button (Host only, for unconfirmed players) */}
          {canKick && (
            <TouchableOpacity
              style={[styles.kickButton, { backgroundColor: '#EF4444' }]}
              onPress={(e) => {
                e.stopPropagation();
                onKickPlayer(player.userId, player.user?.name || 'Player');
              }}
              disabled={isKicking}
            >
              <Ionicons name="close" size={14} color="#FFF" />
            </TouchableOpacity>
          )}
          
          {/* Avatar with Glow Effect */}
          <View style={styles.playerAvatarContainer}>
            <View 
              style={[
                styles.playerAvatar,
                { 
                  borderColor: teamColor,
                  backgroundColor: theme.colors.background,
                  shadowColor: teamColor,
                }
              ]}
            >
              {player.user?.avatar ? (
                <Image
                  source={{ uri: player.user.avatar }}
                  style={styles.playerAvatarImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.playerAvatarPlaceholder, { backgroundColor: teamColor + '30' }]}>
                  <ThemedIcon name="person" size={32} variant="accent" />
                </View>
              )}
            </View>
            
            {/* Confirmed Badge */}
            {player.isConfirmed && (
              <View 
                style={[
                  styles.confirmedBadge,
                  { 
                    backgroundColor: teamColor,
                    borderColor: theme.colors.surface,
                  }
                ]}
              >
                <ThemedIcon name="checkmark" size={14} color="#000" />
              </View>
            )}
          </View>

          {/* Player Name with better contrast */}
          <View 
            style={[
              styles.playerNameContainer,
              { backgroundColor: theme.colors.background + '80' }
            ]}
          >
            <ThemedText 
              variant="secondary" 
              size="s" 
              weight="medium"
              style={styles.playerNameText}
              numberOfLines={1}
            >
              {player.user?.name || 'Unknown'}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  emptySlotCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    width: 110,
    height: 140,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptySlotIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  playerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    width: 110,
    height: 140,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playerCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 64,
  },
  kickButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  playerAvatarContainer: {
    marginTop: 12,
  },
  playerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 3,
    backgroundColor: '#121212',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  playerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  playerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  playerNameContainer: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playerNameText: {
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});

