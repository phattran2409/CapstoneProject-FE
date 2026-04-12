import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { MatchRoomParticipant } from '../types/room.types';
import { CaptainBadge } from './CaptainBadge';
import { TFunction } from 'i18next';

interface ParticipantCardProps {
  t: TFunction;
  participant: MatchRoomParticipant;
  teamColor: string;
  /** Host (viewer) được phép kick người chơi này (ví dụ chỉ khi phòng Open) */
  canKickPlayer: boolean;
  isRoomHost?: boolean;
  currentUserId?: string;
  isKicking: boolean;
  onKickPlayer: (userId: string, playerName: string) => void;
  onPress?: () => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  teamColor,
  canKickPlayer,
  isRoomHost = false,
  currentUserId,
  isKicking,
  onKickPlayer,
  onPress,
  t,
}) => {
  const { theme } = useTheme();
  const isCurrentUser = participant.userId === currentUserId;

  return (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      disabled={!onPress}
    >
      <View
        style={[
          styles.card,
          { 
            backgroundColor: theme.colors.surface,
            borderColor: isCurrentUser ? theme.colors.neonGreen : teamColor,
            borderWidth: isCurrentUser ? 2 : 1,
          }
        ]}
      >
        {/* Captain badge on top-left corner */}
        {participant.isCaptain && (
          <View style={styles.captainBadgeWrapper}>
            <CaptainBadge compact />
          </View>
        )}

        {/* Host badge on top-right corner */}
        {isRoomHost && (
          <View style={styles.hostBadgeWrapper}>
            <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>👑</ThemedText>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {participant.avatarUrl ? (
            <Image
              source={{ uri: participant.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: teamColor + '30' }]}>
              <ThemedText weight="bold" style={{ color: teamColor }}>
                {participant.fullName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
          )}
          {/* Position Badge */}
          {participant.position && (
            <View style={[styles.positionBadge, { backgroundColor: teamColor }]}>
              <ThemedText size="xs" weight="bold" style={{ color: '#fff' }}>
                {participant.position}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Name */}
        <ThemedText 
          size="xs" 
          weight="medium" 
          numberOfLines={1}
          style={styles.name}
        >
          {participant.fullName}
        </ThemedText>

        {/* Deposit Status */}
        <View style={styles.statusContainer}>
          <Ionicons 
            name={participant.depositPaid ? "checkmark-circle" : "time-outline"} 
            size={12} 
            color={participant.depositPaid ? theme.colors.neonGreen : theme.colors.textSecondary} 
          />
          <ThemedText 
            size="xs" 
            variant="secondary"
            style={{ marginLeft: 2 }}
          >
            {participant.depositPaid ? 'Paid' : 'Pending'}
          </ThemedText>
        </View>
        {/* Host Badge */}
        {isRoomHost && (
          <View style={[styles.hostWrapper , { borderColor: theme.colors.neonGreen }]}>
            <ThemedText weight="medium" style={{ color: theme.colors.neonGreen , fontSize: 11 }}>{t('roomDetail.host')}</ThemedText>
          </View>
        )}

        {/* Kick Button (Host only, not for self) */}
        {canKickPlayer && !isCurrentUser && (
          <TouchableOpacity
            onPress={() => onKickPlayer(participant.userId, participant.fullName)}
            disabled={isKicking}
            style={styles.kickButton}
          >
            <Ionicons name="close-circle" size={16} color={theme.colors.error || '#ef4444'} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 80,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  name: {
    textAlign: 'center',
    marginTop: 2,
  },
  captainBadgeWrapper: {
    position: 'absolute',
    top: 4,
    left: 4,
    zIndex: 1,
  },
  hostBadgeWrapper: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  kickButton: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  hostWrapper: {
    marginTop: 4,
    width: '100%',
    flexDirection: 'row',
    padding: 3,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
