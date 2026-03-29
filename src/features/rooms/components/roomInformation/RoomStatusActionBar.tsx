import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import {
  type MatchRoomStatus,
  type MatchRoomParticipant,
} from '@/features/rooms';

interface RoomStatusActionBarProps {
  hasLeftFeedback?: boolean;
  status: MatchRoomStatus;
  activeTab: 'teams' | 'host' | 'venue';
  canJoinMatch: boolean;
  isUpdatingParticipant: boolean;
  currentUserParticipant: MatchRoomParticipant | null;
  hasSelectedTeam: boolean;
  onJoinMatch: () => void;
  onNavigateToFeedbackIntro: () => void;
  onNavigateToEloBreakdown: () => void;
  /** `user.userId` từ auth (truyền từ RoomInformation) */
  currentUserId?: string | null;
  /** Mở phòng từ lịch sử đấu trên profile người khác */
  isViewingOthersMatchHistory?: boolean;
}

const RoomStatusActionBar: React.FC<RoomStatusActionBarProps> = ({
  hasLeftFeedback,
  status,
  activeTab,
  canJoinMatch,
  isUpdatingParticipant,
  currentUserParticipant,
  hasSelectedTeam,
  onJoinMatch,
  onNavigateToFeedbackIntro,
  onNavigateToEloBreakdown,
  currentUserId = null,
  isViewingOthersMatchHistory = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (activeTab !== 'teams') {
    return null;
  }

  const containerStyle = [
    actionStyles.joinButtonContainer,
    {
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
  ];

  if (status === 'Reviewing') {
    if (isViewingOthersMatchHistory || !currentUserId) {
      return (
        <View style={containerStyle}>
          <TouchableOpacity
            style={[actionStyles.joinButton, { backgroundColor: theme.colors.border, shadowColor: 'transparent' }]}
            disabled
          >
            <ThemedText size="l" weight="bold" style={[actionStyles.joinButtonText, { color: theme.colors.textSecondary }]}>
              {t('roomDetail.statusActions.reviewingInProgress', 'Đang đánh giá')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (hasLeftFeedback) {
      return (
        <View style={containerStyle}>
          <TouchableOpacity
            style={[actionStyles.joinButton, { backgroundColor: theme.colors.border, shadowColor: 'transparent' }]}
            disabled
          >
            <ThemedText size="l" weight="bold" style={[actionStyles.joinButtonText, { color: theme.colors.textSecondary }]}>
              {t('roomDetail.statusActions.hasLeftFeedback', 'Bạn đã đánh giá trận đấu')}
            </ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[
            actionStyles.joinButton,
            {
              backgroundColor: theme.colors.neonGreen,
              shadowColor: theme.colors.neonGreen,
            },
          ]}
          onPress={onNavigateToFeedbackIntro}
        >
          <ThemedText
            size="l"
            weight="bold"
            style={[actionStyles.joinButtonText, { color: '#000' }]}
          >
            {t('roomDetail.statusActions.reviewing', 'Đánh giá trận đấu')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'Completed' && isViewingOthersMatchHistory) {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[actionStyles.joinButton, { backgroundColor: theme.colors.border, shadowColor: 'transparent' }]}
          disabled
        >
          <ThemedText size="l" weight="bold" style={[actionStyles.joinButtonText, { color: theme.colors.textSecondary }]}>
            {t('roomDetail.statusActions.matchFinishedReadOnly', 'Trận đấu đã xong')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (hasLeftFeedback) {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[actionStyles.joinButton, { backgroundColor: theme.colors.border, shadowColor: 'transparent' }]}
          disabled
        >
          <ThemedText size="l" weight="bold" style={[actionStyles.joinButtonText, { color: theme.colors.textSecondary }]}>
            {t('roomDetail.statusActions.hasLeftFeedback', 'Bạn đã đánh giá trận đấu')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'Completed') {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[
            actionStyles.joinButton,
            {
              backgroundColor: theme.colors.neonGreen,
              shadowColor: theme.colors.neonGreen,
            },
          ]}
          onPress={onNavigateToEloBreakdown}
        >
          <ThemedText
            size="l"
            weight="bold"
            style={[actionStyles.joinButtonText, { color: '#000' }]}
          >
            {t('roomDetail.statusActions.completed', 'Xem thay đổi Elo')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (status === 'Cancelled') {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[
            actionStyles.joinButton,
            {
              backgroundColor: theme.colors.border,
              shadowColor: 'transparent',
            },
          ]}
          disabled
        >
          <ThemedText
            size="l"
            weight="bold"
            style={[
              actionStyles.joinButtonText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t('roomDetail.statusActions.cancelled', 'Phòng đã bị hủy')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  if (isViewingOthersMatchHistory) {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[
            actionStyles.joinButton,
            { backgroundColor: theme.colors.border, shadowColor: 'transparent' },
          ]}
          disabled
        >
          <ThemedText
            size="l"
            weight="bold"
            style={[actionStyles.joinButtonText, { color: theme.colors.textSecondary }]}
          >
            {t(
              'roomDetail.statusActions.historyViewReadOnly',
              'Đang xem trận từ lịch sử người chơi khác',
            )}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[
          actionStyles.joinButton,
          {
            backgroundColor: canJoinMatch
              ? theme.colors.neonGreen
              : theme.colors.border,
            shadowColor: canJoinMatch ? theme.colors.neonGreen : 'transparent',
          },
        ]}
        onPress={onJoinMatch}
        disabled={!canJoinMatch || isUpdatingParticipant}
      >
        <ThemedText
          size="l"
          weight="bold"
          style={[
            actionStyles.joinButtonText,
            { color: canJoinMatch ? '#000' : theme.colors.textSecondary },
          ]}
        >
          {isUpdatingParticipant
            ? t('roomDetail.teamJoinButton.joining')
            : !currentUserParticipant
              ? t('roomDetail.teamJoinButton.joinFirst')
              : hasSelectedTeam
                ? t('roomDetail.teamJoinButton.join')
                : t('roomDetail.teamJoinButton.joinFirst')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

const actionStyles = StyleSheet.create({
  joinButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  joinButton: {
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    textAlign: 'center',
  },
});

export { RoomStatusActionBar };

