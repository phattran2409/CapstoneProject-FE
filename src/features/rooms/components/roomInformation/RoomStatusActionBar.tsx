import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import {
  type MatchRoomStatus,
  type MatchRoomParticipant,
} from '@/features/rooms';
import { styles } from '@/features/rooms/screens/RoomInformation';

interface RoomStatusActionBarProps {
  status: MatchRoomStatus;
  activeTab: 'teams' | 'host' | 'venue';
  canJoinMatch: boolean;
  isUpdatingParticipant: boolean;
  currentUserParticipant: MatchRoomParticipant | null;
  hasSelectedTeam: boolean;
  onJoinMatch: () => void;
  onNavigateToFeedbackIntro: () => void;
  onNavigateToEloBreakdown: () => void;
}

const RoomStatusActionBar: React.FC<RoomStatusActionBarProps> = ({
  status,
  activeTab,
  canJoinMatch,
  isUpdatingParticipant,
  currentUserParticipant,
  hasSelectedTeam,
  onJoinMatch,
  onNavigateToFeedbackIntro,
  onNavigateToEloBreakdown,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (activeTab !== 'teams') {
    return null;
  }

  const containerStyle = [
    styles.joinButtonContainer,
    {
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
  ];

  if (status === 'Reviewing') {
    return (
      <View style={containerStyle}>
        <TouchableOpacity
          style={[
            styles.joinButton,
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
            style={[styles.joinButtonText, { color: '#000' }]}
          >
            {t('roomDetail.statusActions.reviewing', 'Đánh giá trận đấu')}
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
            styles.joinButton,
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
            style={[styles.joinButtonText, { color: '#000' }]}
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
            styles.joinButton,
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
              styles.joinButtonText,
              { color: theme.colors.textSecondary },
            ]}
          >
            {t('roomDetail.statusActions.cancelled', 'Phòng đã bị hủy')}
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={[
          styles.joinButton,
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
            styles.joinButtonText,
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

export { RoomStatusActionBar };

