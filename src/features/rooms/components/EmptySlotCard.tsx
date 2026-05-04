import React, { useRef } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { ThemedText, ThemedIcon } from '@/shared/components/themed';
import type { TeamAssignment } from '../types/room.types';

interface EmptySlotCardProps {
  teamAssignment: TeamAssignment;
  teamColor: string;
  isJoining?: boolean;
  disabled?: boolean;
  onPress: (teamAssignment: TeamAssignment) => void;
}

export const EmptySlotCard: React.FC<EmptySlotCardProps> = ({
  teamAssignment,
  teamColor,
  isJoining = false,
  disabled = false,
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

  const teamLabel = teamAssignment === 'A' ? t('roomDetail.teamA', 'Team A') : teamAssignment === 'B' ? t('roomDetail.teamB', 'Team B') : t('roomDetail.team', 'Team');

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(teamAssignment)}
        disabled={isJoining || disabled}
      >
        <View
          style={[
            styles.card,
            { 
              borderColor: isJoining ? theme.colors.neonGreen : teamColor,
              backgroundColor: theme.colors.surface + '60',
              opacity: disabled ? 0.5 : 1,
            }
          ]}
        >
          {/* Icon Container */}
          <View 
            style={[
              styles.iconContainer,
              { backgroundColor: teamColor + '20' }
            ]}
          >
            <ThemedIcon 
              name={isJoining ? "hourglass" : "add-circle-outline"} 
              size={28} 
              color={teamColor}
            />
          </View>

          {/* Text */}
          <ThemedText 
            variant="secondary" 
            size="xs" 
            weight="medium"
            style={styles.text}
          >
            {isJoining ? t('common.buttons.processing') : t('roomDetail.join')}
          </ThemedText>

          {/* Team Badge */}
          <View style={[styles.teamBadge, { backgroundColor: teamColor + '30' }]}>
            <ThemedText size="xs" weight="bold" style={{ color: teamColor }}>
              {teamAssignment === 'A' ? t('roomDetail.teamA') : teamAssignment === 'B' ? t('roomDetail.teamB') : t('roomDetail.team')}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 80,
    height: 110,
    padding: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  text: {
    textAlign: 'center',
    marginBottom: 4,
  },
  teamBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});
