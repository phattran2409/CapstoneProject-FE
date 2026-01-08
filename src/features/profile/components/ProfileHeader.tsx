import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import Svg, { 
  Path, 
  Text as SvgText, 
  Defs, 
  LinearGradient as SvgLinearGradient, 
  Stop,
} from 'react-native-svg';

interface ProfileHeaderProps {
  name: string;
  elo: number;
  description?: string;
  age?: number; 
  position?: string;
  shirtNumber?: number;
  matchesCount?: number;
  onEditPress?: () => void;
}

//SVG Jersey Badge
const JerseyBadge: React.FC<{ number: number; accent: string; text: string }> = ({
  number,
  accent,
  text,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.jerseyRow}>
      {/* Jersey SVG */}
      <Svg width={70} height={80} viewBox="0 0 70 80">
        <Defs>
          <SvgLinearGradient id="jerseyBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#1E2D3D" stopOpacity="1" />
            <Stop offset="100%" stopColor="#0D1B2A" stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>

        {/* Jersey Body */}
        <Path
          d="M15 25 L15 72 Q15 76 19 76 L51 76 Q55 76 55 72 L55 25"
          fill="url(#jerseyBg)"
        />

        {/* Left Sleeve */}
        <Path
          d="M15 25 L5 32 Q2 35 4 40 L12 48 L15 42"
          fill="url(#jerseyBg)"
        />

        {/* Right Sleeve */}
        <Path
          d="M55 25 L65 32 Q68 35 66 40 L58 48 L55 42"
          fill="url(#jerseyBg)"
        />

        {/* Collar - Curved Downwards */}
        <Path
          d="M23 25 Q35 42 47 25 Q41 32 35 28 Q29 32 23 25 Z"
          fill={accent}
        />

        {/* Jersey Number */}
        <SvgText
          x="35"
          y="58"
          fill="#FFFFFF"
          fontSize={number > 9 ? 26 : 30}
          fontWeight="800"
          textAnchor="middle"
        >
          {number}
        </SvgText>
      </Svg>

      {/* Position Text */}
      <View style={styles.positionContainer}>
        <Text style={[styles.positionLabel, { color: theme.colors.textSecondary }]}>
          {t('personalPage.position')}
        </Text>
        <Text style={[styles.positionText, { color: accent }]}>
          {text}
        </Text>
      </View>
    </View>
  );
};


export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  elo,
  description = 'King of the Pitch - Chuyên gia kiến tạo',
  age = 20,
  position = 'Forward',
  shirtNumber = 10,
  matchesCount = 100,
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
      <View style={{ alignItems: 'center', marginBottom: theme.spacing.m }}>
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
        {/* Description */}
      <Text
        style={[
          styles.quote,
          {
            fontSize: theme.fontSizes.m,
            color: theme.colors.textSecondary,
            textAlign: 'center',
          },
        ]}
      >
        {description} 
      </Text>
      </View>

      {/* Rank Badge */}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.colors.border === '#E0E0E0' ? '#2C2C2C' : '#2C2C2C',
            borderRadius: theme.radius.m,
            paddingVertical: theme.spacing.s,
            paddingHorizontal: theme.spacing.m,
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
          Elo Score
        </Text>
      </View>
      <JerseyBadge
          number={shirtNumber}
          accent={theme.colors.neonGreen}
          text={position}
        />

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.s }}>
         <Ionicons name="pencil" size={18} color={theme.colors.black} />
       
        <Text
          style={[
            styles.editButtonText,
            {
              fontSize: theme.fontSizes.m,
              color: theme.colors.background,
            },
          ]}
        >
           {t('personalPage.editProfile')}
           </Text>
           </View>
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
  statsContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    flexDirection: 'row',
    gap: 12,
  },
  jerseyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  positionContainer: {
    alignItems: 'flex-start',
  },
  positionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  positionText: {
    fontWeight: '800',
    fontSize: 18,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  innerBorder: {
    position: 'absolute',
    top: 1,
    left: 1,
    right: 1,
    bottom: 1,
    borderRadius: 15,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});

