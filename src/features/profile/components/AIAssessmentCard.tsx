import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

interface AIAssessmentCardProps {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
}

export const AIAssessmentCard: React.FC<AIAssessmentCardProps> = ({
  title,
  description,
  icon = 'star',
  iconColor,
}) => {
  const { theme } = useTheme();
  const finalIconColor = iconColor || theme.colors.neonGreen;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.m,
          padding: theme.spacing.m,
          marginBottom: theme.spacing.m,
        },
      ]}
    >
      <View style={styles.header}>
        <Ionicons name={icon} size={20} color={finalIconColor} />
        <Text
          style={[
            styles.title,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              marginLeft: theme.spacing.s,
            },
          ]}
        >
          {title}
        </Text>
      </View>
      <Text
        style={[
          styles.description,
          {
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
            marginTop: theme.spacing.s,
          },
        ]}
      >
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontWeight: '600',
  },
  description: {
    lineHeight: 20,
  },
});

