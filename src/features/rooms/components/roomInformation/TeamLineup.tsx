import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText, ThemedIcon } from '@/shared/components/themed';
import { useTheme } from '@/shared/theme';
import type { TFunction } from 'i18next';
import type { MatchRoomFullInfo, MatchRoomParticipant, TeamAssignment } from '@/features/rooms';
import { ParticipantCard } from '../ParticipantCard';
import { EmptySlotCard } from '../EmptySlotCard';

interface TeamLineupProps {
  displayRoom: MatchRoomFullInfo;
  t: TFunction;
  isSignalRConnected: boolean;
  currentUserParticipant: MatchRoomParticipant | null;
  isHost: boolean;
  currentUserId: string | undefined;
  isKicking: boolean;
  onKickPlayer: (userId: string, playerName: string) => void;
  isUpdatingParticipant: boolean;
  pendingTeamAssignment: TeamAssignment | null;
  onOpenPositionModal: (teamAssignment: TeamAssignment) => void;
  onParticipantPress?: (userId: string) => void;
  /** Xem phòng từ lịch sử người chơi khác — tắt kick / ô trống join */
  roomActionsDisabled?: boolean;
}

export const TeamLineup: React.FC<TeamLineupProps> = ({
  displayRoom,
  t,
  isSignalRConnected,
  currentUserParticipant,
  isHost,
  currentUserId,
  isKicking,
  onKickPlayer,
  isUpdatingParticipant,
  pendingTeamAssignment,
  onOpenPositionModal,
  onParticipantPress,
  roomActionsDisabled = false,
}) => {
  const { theme } = useTheme();
  const slotsPerTeam = displayRoom.totalSlots / 2;
  const canHostActOnParticipants = isHost && !roomActionsDisabled;

  return (
    <View style={styles.teamLineupSection}>
      <View style={styles.teamLineupHeader}>
        <ThemedText variant="primary" size="l" weight="bold">
          {t('roomDetail.teamLineup')} ({displayRoom.filledSlots}/{displayRoom.totalSlots})
        </ThemedText>
        <View style={styles.signalRIndicator}>
          <View
            style={[
              styles.signalRDot,
              {
                backgroundColor: isSignalRConnected
                  ? theme.colors.neonGreen
                  : theme.colors.textSecondary,
              },
            ]}
          />
          <ThemedText variant="secondary" size="xs">
            {isSignalRConnected ? 'Live' : 'Offline'}
          </ThemedText>
        </View>
      </View>

      {/* Team A */}
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <ThemedIcon name="shield" size={20} variant="accent" />
          <ThemedText variant="accent" size="m" weight="bold" style={styles.teamName}>
            {t('roomDetail.teamA')}
          </ThemedText>
          {currentUserParticipant?.teamAssignment === 'A' && (
            <View
              style={[styles.selectedTeamBadge, { backgroundColor: theme.colors.neonGreen + '30' }]}
            >
              <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>
                {t('roomDetail.yourTeam')}
              </ThemedText>
            </View>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContainer}
        >
          {displayRoom.participants.teamA.map((participant) => (
            <ParticipantCard
              key={participant.participantId}
              participant={participant}
              teamColor="#4CAF50"
              isHost={canHostActOnParticipants}
              currentUserId={currentUserId}
              isKicking={isKicking}
              onKickPlayer={onKickPlayer}
              onPress={() => onParticipantPress?.(participant.userId)}
            />
          ))}
          {displayRoom.participants.teamA.length < slotsPerTeam && (
            <EmptySlotCard
              teamAssignment="A"
              teamColor="#4CAF50"
              isJoining={isUpdatingParticipant && pendingTeamAssignment === 'A'}
              disabled={roomActionsDisabled}
              onPress={() => onOpenPositionModal('A')}
            />
          )}
        </ScrollView>
      </View>

      {/* Team B */}
      <View style={styles.teamContainer}>
        <View style={styles.teamHeader}>
          <ThemedIcon name="shield" size={20} variant="accent" />
          <ThemedText variant="accent" size="m" weight="bold" style={styles.teamName}>
            {t('roomDetail.teamB')}
          </ThemedText>
          {currentUserParticipant?.teamAssignment === 'B' && (
            <View
              style={[styles.selectedTeamBadge, { backgroundColor: theme.colors.neonGreen + '30' }]}
            >
              <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>
                Your Team
              </ThemedText>
            </View>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContainer}
        >
          {displayRoom.participants.teamB.map((participant) => (
            <ParticipantCard
              key={participant.participantId}
              participant={participant}
              teamColor="#2196F3"
              isHost={canHostActOnParticipants}
              currentUserId={currentUserId}
              isKicking={isKicking}
              onKickPlayer={onKickPlayer}
              onPress={() => onParticipantPress?.(participant.userId)}
            />
          ))}
          {displayRoom.participants.teamB.length < slotsPerTeam && (
            <EmptySlotCard
              teamAssignment="B"
              teamColor="#2196F3"
              isJoining={isUpdatingParticipant && pendingTeamAssignment === 'B'}
              disabled={roomActionsDisabled}
              onPress={() => onOpenPositionModal('B')}
            />
          )}
        </ScrollView>
      </View>

      {/* Unassigned Players */}
      {displayRoom.participants.unassigned.length > 0 && (
        <View style={styles.teamContainer}>
          <View style={styles.teamHeader}>
            <ThemedIcon name="people" size={20} variant="secondary" />
            <ThemedText variant="secondary" size="m" weight="bold" style={styles.teamName}>
              {t('roomDetail.unassigned')}
            </ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playersScrollContainer}
          >
            {displayRoom.participants.unassigned.map((participant) => (
              <ParticipantCard
                key={participant.participantId}
                participant={participant}
                teamColor="#9E9E9E"
                isHost={canHostActOnParticipants}
                currentUserId={currentUserId}
                isKicking={isKicking}
                onKickPlayer={onKickPlayer}
                onPress={() => onParticipantPress?.(participant.userId)}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  teamLineupSection: {
    marginBottom: 24,
  },
  teamLineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  signalRIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalRDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  teamContainer: {
    marginBottom: 24,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  teamName: {
    marginLeft: 4,
  },
  selectedTeamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playersScrollContainer: {
    gap: 12,
  },
});
