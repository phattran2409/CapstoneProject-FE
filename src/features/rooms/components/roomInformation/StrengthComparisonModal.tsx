import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
  Image,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { TFunction } from 'i18next';
import Svg, { Circle } from 'react-native-svg';

interface StrengthComparisonModalProps {
  t: TFunction;
  visible: boolean;
  onClose: () => void;
  teamAName: string;
  teamBName: string;
  eloA: number;
  eloB: number;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

export const StrengthComparisonModal: React.FC<StrengthComparisonModalProps> = ({
  t,
  visible,
  onClose,
  teamAName,
  teamBName,
  eloA,
  eloB,
}) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const totalElo = eloA + eloB;
  const percentA = totalElo > 0 ? (eloA / totalElo) * 100 : 50;
  const percentB = totalElo > 0 ? (eloB / totalElo) * 100 : 50;
  
  let advTeam = 'None';
  let advPercent = 0;
  let advTeamName = '';
  
  if (eloA > eloB) {
    advTeam = 'A';
    advPercent = ((eloA - eloB) / eloB) * 100;
    advTeamName = teamAName;
  } else if (eloB > eloA) {
    advTeam = 'B';
    advPercent = ((eloB - eloA) / eloA) * 100;
    advTeamName = teamBName;
  }

  const radius = 100;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharrayB = `${(percentB / 100) * circumference} ${circumference}`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
          },
        ]}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        style={[
          styles.modalContainer,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.handleBarContainer}>
          <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
        </View>

        <View style={styles.header}>
          <ThemedText size="xl" weight="bold">
            {t('strengthModal.title')}
          </ThemedText>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <View style={styles.chartSection}>
          <View style={styles.teamsRow}>
            <View style={styles.teamInfoLeft}>
              <ThemedText size="l" weight="bold" style={{ color: '#4CAF50' }}>{teamAName}</ThemedText>
              <View style={[styles.eloBadge, { borderColor: '#4CAF50', backgroundColor: '#4CAF5020' }]}>
                <ThemedText size="s" weight="bold" style={{ color: '#4CAF50' }}>{Math.round(eloA)} Elo</ThemedText>
              </View>
            </View>

            <View style={styles.chartContainer}>
              <Svg height={radius * 2 + strokeWidth} width={radius * 2 + strokeWidth} viewBox={`0 0 ${radius * 2 + strokeWidth} ${radius * 2 + strokeWidth}`}>
                {/* Team A Circle (Background) */}
                <Circle
                  cx={(radius * 2 + strokeWidth) / 2}
                  cy={(radius * 2 + strokeWidth) / 2}
                  r={radius}
                  stroke="#4CAF50" // Darker green for A
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                {/* Team B Circle (Foreground) */}
                <Circle
                  cx={(radius * 2 + strokeWidth) / 2}
                  cy={(radius * 2 + strokeWidth) / 2}
                  r={radius}
                  stroke="#a8e063" // Lighter green for B
                  strokeWidth={strokeWidth}
                  fill="none"
                  strokeDasharray={strokeDasharrayB}
                  strokeDashoffset={circumference / 4} // Start from top, goes right
                  strokeLinecap="butt"
                />
              </Svg>
              <View style={styles.logoContainer}>
                <Image source={require('../../../../assets/kickify/logo_app.png')} style={styles.logo} resizeMode="contain" />
              </View>
            </View>

            <View style={styles.teamInfoRight}>
              <ThemedText size="l" weight="bold" style={{ color: '#a8e063' }}>{teamBName}</ThemedText>
              <View style={[styles.eloBadge, { borderColor: '#a8e063', backgroundColor: '#a8e06320' }]}>
                <ThemedText size="s" weight="bold" style={{ color: '#a8e063' }}>{Math.round(eloB)} Elo</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.advantageCard, { backgroundColor: theme.colors.surface }]}>
          {advTeam === 'None' ? (
            <>
              <View style={styles.advTitleRow}>
                <Ionicons name="git-compare" size={20} color={theme.colors.neonGreen} />
                <ThemedText size="l" weight="bold" style={{ color: theme.colors.neonGreen, marginLeft: 8 }}>
                  {t('strengthModal.advantageNone')}
                </ThemedText>
              </View>
              <ThemedText variant="secondary" size="s" style={{ textAlign: 'center', marginTop: 8 }}>
                {t('strengthModal.advantageDescNone')}
              </ThemedText>
            </>
          ) : (
            <>
              <View style={styles.advTitleRow}>
                <Ionicons name="trending-up" size={20} color={theme.colors.neonGreen} />
                <ThemedText size="l" weight="bold" style={{ color: theme.colors.neonGreen, marginLeft: 8 }}>
                  {advTeam === 'A' ? t('strengthModal.advantageA', { teamNameA: teamAName }) : t('strengthModal.advantageB', { teamNameB: teamBName })}
                </ThemedText>
              </View>
              <ThemedText variant="secondary" size="s" style={{ textAlign: 'center', marginTop: 8 }}>
                {t('strengthModal.advantageDesc', { team: advTeamName, percent: advPercent.toFixed(1) })}
              </ThemedText>
            </>
          )}
        </View>

      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  backdropPressable: {
    flex: 1,
  },
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  handleBarContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  teamInfoLeft: {
    alignItems: 'center',
    flex: 1,
  },
  teamInfoRight: {
    alignItems: 'center',
    flex: 1,
  },
  eloBadge: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  logoContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logo: {
    width: 80,
    height: 80,
  },
  advantageCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  advTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
