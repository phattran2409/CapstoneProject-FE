import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ProfileHeaderProps {
  name: string;
  elo: number;
  rank: string;
  quote?: string;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  elo,
  rank,
  quote = 'King of the Pitch',
  onEditPress,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { marginBottom: theme.spacing.l }]}>
      {/* Avatar */}
      <View
        style={[
          styles.avatar,
          {
            borderColor: theme.colors.neonGreen,
            backgroundColor: '#E8D5C4',
            marginBottom: theme.spacing.m,
          },
        ]}
      >
        <Ionicons name="person" size={60} color={theme.colors.textSecondary} />
      </View>

      {/* Name */}
      <Text
        style={[
          styles.name,
          {
            fontSize: theme.fontSizes.xxl,
            color: theme.colors.text,
            marginBottom: theme.spacing.xs,
          },
        ]}
      >
        {name}
      </Text>

      {/* Rank Badge */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.border === '#E0E0E0' ? '#2C2C2C' : '#2C2C2C',
            borderRadius: theme.radius.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
            marginBottom: theme.spacing.m,
          },
        ]}
      >
        <Ionicons name="trophy" size={18} color={theme.colors.neonGreen} />
        <Text
          style={[
            styles.elo,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.neonGreen,
              marginLeft: theme.spacing.xs,
            },
          ]}
        >
          {elo.toLocaleString()}
        </Text>
        <Text
          style={[
            styles.rank,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.white,
              marginLeft: theme.spacing.s,
            },
          ]}
        >
          {rank}
        </Text>
      </View>

      {/* Quote */}
      <Text
        style={[
          styles.quote,
          {
            fontSize: theme.fontSizes.m,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.m,
            textAlign: 'center',
          },
        ]}
      >
        "{quote} - Chuyên gia kiến tạo"
      </Text>

      {/* Edit Button */}
      <TouchableOpacity
        onPress={onEditPress}
        style={[
          styles.editButton,
          {
            backgroundColor: theme.colors.neonGreen,
            borderRadius: theme.radius.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.xl,
          },
        ]}
      >
        <Text
          style={[
            styles.editButtonText,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.white,
            },
          ]}
        >
          {t('personalPage.editProfile')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  name: {
    fontWeight: '700',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  elo: {
    fontWeight: '600',
  },
  rank: {
    fontWeight: '600',
  },
  quote: {
    fontStyle: 'italic',
  },
  editButton: {
    paddingVertical: 8,
    paddingHorizontal: 32,
  },
  editButtonText: {
    fontWeight: '600',
  },
});

