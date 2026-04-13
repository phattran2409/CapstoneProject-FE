import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import Ionicons from '@expo/vector-icons/Ionicons';

/** Icon names coming from the backend (highlightAxis / icon field) */
type BackendIcon = 'shield' | 'message-circle' | 'star' | 'trophy' | 'people' | string;

/** Map BE icon names → Ionicons glyph names */
const ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  shield: 'shield-checkmark-outline',
  'message-circle': 'chatbubble-ellipses-outline',
  star: 'star-outline',
  trophy: 'trophy-outline',
  people: 'people-outline',
};

const resolveIcon = (icon?: BackendIcon): keyof typeof Ionicons.glyphMap => {
  if (!icon) return 'star-outline';
  if (icon in ICON_MAP) return ICON_MAP[icon];
  // Try as a direct Ionicons name (already correct)
  return icon as keyof typeof Ionicons.glyphMap;
};

interface AIAssessmentCardProps {
  title: string;
  description: string;
  /** Backend icon string OR Ionicons glyph name */
  icon?: BackendIcon;
  iconColor?: string;
  /** "strength" | "improvement" — controls default icon colour */
  type?: string;
}

export const AIAssessmentCard: React.FC<AIAssessmentCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  type,
}) => {
  const { theme } = useTheme();

  const defaultColor =
    type === 'improvement' ? theme.colors.textSecondary : theme.colors.neonGreen;
  const finalIconColor = iconColor || defaultColor;
  const resolvedIcon = resolveIcon(icon);

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
        <Ionicons name={resolvedIcon} size={20} color={finalIconColor} />
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

