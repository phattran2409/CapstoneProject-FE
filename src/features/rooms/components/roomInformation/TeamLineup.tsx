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
  /** userId của host phòng để hiển thị badge host trên PlayerCard */
  hostId?: string;
  currentUserId: string | undefined;
  isKicking: boolean;
  onKickPlayer: (userId: string, playerName: string) => void;
  isUpdatingParticipant: boolean;
  pendingTeamAssignment: TeamAssignment | null;
  onOpenPositionModal: (teamAssignment: TeamAssignment) => void;
  onParticipantPress?: (userId: string) => void;
  /** Xem phòng từ lịch sử người chơi khác — tắt kick / ô trống join */
  roomActionsDisabled?: boolean;
  teamAName: string;
  teamBName: string;
}

export const TeamLineup: React.FC<TeamLineupProps> = ({
  displayRoom,
  t,
  isSignalRConnected,
  currentUserParticipant,
  isHost,
  hostId,
  currentUserId,
  isKicking,
  onKickPlayer,
  isUpdatingParticipant,
  pendingTeamAssignment,
  onOpenPositionModal,
  onParticipantPress,
  roomActionsDisabled = false,
  teamAName,
  teamBName,
}) => {
  const { theme } = useTheme();
  const slotsPerTeam = displayRoom.totalSlots / 2;
  const canHostActOnParticipants = isHost && !roomActionsDisabled;
  /** Kick chỉ khi phòng còn Open; host không kick được khi Locked / InProgress / … */
  const hostCanKickParticipant =
    canHostActOnParticipants && displayRoom.status === "Open";

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
           {teamAName ? teamAName : t('roomDetail.teamA')}
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
          <ThemedText variant="secondary" size="xs" weight="medium" style={styles.teamAvgElo}>
            {t('roomDetail.teamAverageElo', {
              value: Math.round(displayRoom.teamAAverageElo ?? 0),
            })}
          </ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContainer}
        >
          {displayRoom.participants.teamA.map((participant) => (
            <ParticipantCard
              t={t}
              key={participant.participantId}
              participant={participant}
              teamColor="#4CAF50"
              canKickPlayer={hostCanKickParticipant}
              isRoomHost={!!hostId && participant.userId === hostId}
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
          <ThemedIcon name="shield" size={20} color={theme.colors.blueSky} />
      
          <ThemedText size="m" weight="bold" style={[styles.teamName, { color: theme.colors.blueSky }]}>
          {teamBName ? teamBName : t('roomDetail.teamB')}
          </ThemedText>
          {currentUserParticipant?.teamAssignment === 'B' && (
            <View
              style={[styles.selectedTeamBadge, { backgroundColor: theme.colors.blueSky + '30' }]}
            >
              <ThemedText size="xs" weight="bold" style={{ color: theme.colors.blueSky }}>
                {t('roomDetail.yourTeam')}
              </ThemedText>
            </View>
          )}
          <ThemedText variant="secondary" size="xs" weight="medium" style={styles.teamAvgElo}>
            {t('roomDetail.teamAverageElo', {
              value: Math.round(displayRoom.teamBAverageElo ?? 0),
            })}
          </ThemedText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playersScrollContainer}
        >
          {displayRoom.participants.teamB.map((participant) => (
            <ParticipantCard
              t={t}
              key={participant.participantId}
              participant={participant}
              teamColor="#2196F3"
              canKickPlayer={hostCanKickParticipant}
              isRoomHost={!!hostId && participant.userId === hostId}
              currentUserId={currentUserId}
              isKicking={isKicking}
              onKickPlayer={onKickPlayer}
              onPress={() => onParticipantPress?.(participant.userId)}
            />
          ))}
          {displayRoom.participants.teamB.length < slotsPerTeam && (
            <EmptySlotCard
              teamAssignment="B"
              teamColor={theme.colors.blueSky}
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
                t={t}
                key={participant.participantId}
                participant={participant}
                teamColor="#9E9E9E"
                canKickPlayer={hostCanKickParticipant}
                isRoomHost={!!hostId && participant.userId === hostId}
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
    flexWrap: 'wrap',
  },
  teamName: {
    marginLeft: 4,
    flexShrink: 1,
  },
  teamAvgElo: {
    marginLeft: 'auto',
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
