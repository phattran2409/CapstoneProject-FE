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
import { PieChart } from 'react-native-gifted-charts';

interface StrengthComparisonModalProps {
  t: TFunction;
  visible: boolean;
  onClose: () => void;
  teamAName: string;
  teamBName: string;
  eloA: number;
  eloB: number;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const COLOR_A = '#4CAF50';  // Team A — solid green
const COLOR_B = '#a8e063';  // Team B — light lime

const CHART_RADIUS     = 90;
const CHART_INNER_RAD  = 60;  // donut hole radius

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
  const slideAnim    = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
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

  // ── Elo calculations ────────────────────────────────────────────────────────
  const safeTotal = (eloA + eloB) > 0 ? eloA + eloB : 1;
  const pctA      = parseFloat(((eloA / safeTotal) * 100).toFixed(1));
  const pctB      = parseFloat(((eloB / safeTotal) * 100).toFixed(1));

  // Advantage
  let advTeam     = 'None';
  let advPercent  = 0;
  let advTeamName = '';
  let advColor    = theme.colors.neonGreen;
  if (eloA > eloB) {
    advTeam     = 'A';
    advPercent  = ((eloA - eloB) / (eloB > 0 ? eloB : 1)) * 100;
    advTeamName = teamAName;
    advColor    = COLOR_A;
  } else if (eloB > eloA) {
    advTeam     = 'B';
    advPercent  = ((eloB - eloA) / (eloA > 0 ? eloA : 1)) * 100;
    advTeamName = teamBName;
    advColor    = COLOR_B;
  }

  // ── PieChart data: value = %, color per team ─────────────────────────────
  const pieData = [
    { value: pctA, color: COLOR_A, gradientCenterColor: COLOR_A },
    { value: pctB, color: COLOR_B, gradientCenterColor: COLOR_B },
  ];

  // Center label rendered as custom component
  const CenterLabel = () => (
    <View style={styles.centerLabel}>
      <Image
        source={require('../../../../assets/kickify/logo_app.png')}
        style={styles.centerLogo}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.background,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="stats-chart" size={20} color={theme.colors.neonGreen} />
          <ThemedText size="xl" weight="bold" style={styles.headerTitle}>
            {t('strengthModal.title')}
          </ThemedText>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* ── Pie chart ─────────────────────────────────────────────────────── */}
        <View style={styles.chartRow}>
          {/* Legend — Team A */}
          <View style={styles.legendLeft}>
            <View style={[styles.legendDot, { backgroundColor: COLOR_A }]} />
            <ThemedText size="s" weight="bold" style={{ color: COLOR_A }} numberOfLines={2}>
              {teamAName}
            </ThemedText>
            <ThemedText size="xl" weight="bold" style={{ color: COLOR_A, marginTop: 4 }}>
              {pctA}%
            </ThemedText>
            <ThemedText size="xs" variant="secondary">{Math.round(eloA)} Elo</ThemedText>
          </View>

          {/* Chart */}
          <PieChart
            data={pieData}
            radius={CHART_RADIUS}
            innerRadius={CHART_INNER_RAD}
            innerCircleColor={theme.colors.background}
            centerLabelComponent={CenterLabel}
            strokeColor={theme.colors.background}
            strokeWidth={2}
          />

          {/* Legend — Team B */}
          <View style={styles.legendRight}>
            <View style={[styles.legendDot, { backgroundColor: COLOR_B }]} />
            <ThemedText size="s" weight="bold" style={{ color: COLOR_B }} numberOfLines={2}>
              {teamBName}
            </ThemedText>
            <ThemedText size="xl" weight="bold" style={{ color: COLOR_B, marginTop: 4 }}>
              {pctB}%
            </ThemedText>
            <ThemedText size="xs" variant="secondary">{Math.round(eloB)} Elo</ThemedText>
          </View>
        </View>

        {/* ── Proportional bar ──────────────────────────────────────────────── */}
        <View style={[styles.barCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.barLabelRow}>
            <ThemedText size="xs" variant="secondary" numberOfLines={1} style={{ flex: 1 }}>
              {teamAName}
            </ThemedText>
            <ThemedText size="xs" variant="secondary" numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
              {teamBName}
            </ThemedText>
          </View>

          <View style={[styles.barTrack, { backgroundColor: COLOR_B + '55' }]}>
            <View style={[styles.barFill, { width: `${pctA}%` as any, backgroundColor: COLOR_A }]} />
          </View>

          <View style={styles.barValueRow}>
            <ThemedText size="s" weight="bold" style={{ color: COLOR_A }}>{pctA}%</ThemedText>
            <ThemedText size="xs" variant="secondary">vs</ThemedText>
            <ThemedText size="s" weight="bold" style={{ color: COLOR_B }}>{pctB}%</ThemedText>
          </View>
        </View>

        {/* ── Advantage card ────────────────────────────────────────────────── */}
        <View
          style={[
            styles.advCard,
            { backgroundColor: advColor + '18', borderColor: advColor + '44' },
          ]}
        >
          {advTeam === 'None' ? (
            <>
              <View style={styles.advRow}>
                <Ionicons name="git-compare" size={18} color={theme.colors.neonGreen} />
                <ThemedText size="m" weight="bold" style={{ color: theme.colors.neonGreen, marginLeft: 8 }}>
                  {t('strengthModal.advantageNone')}
                </ThemedText>
              </View>
              <ThemedText variant="secondary" size="s" style={styles.advDesc}>
                {t('strengthModal.advantageDescNone')}
              </ThemedText>
            </>
          ) : (
            <>
              <View style={styles.advRow}>
                <Ionicons name="trending-up" size={18} color={advColor} />
                <ThemedText size="m" weight="bold" style={{ color: advColor, marginLeft: 8 }}>
                  {advTeam === 'A'
                    ? t('strengthModal.advantageA', { teamNameA: teamAName })
                    : t('strengthModal.advantageB', { teamNameB: teamBName })}
                </ThemedText>
              </View>
              <ThemedText variant="secondary" size="s" style={styles.advDesc}>
                {t('strengthModal.advantageDesc', {
                  team: advTeamName,
                  percent: advPercent.toFixed(1),
                })}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },

  handleWrap: { alignItems: 'center', paddingVertical: 12 },
  handle: { width: 40, height: 4, borderRadius: 2 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: { flex: 1, marginLeft: 8 },
  closeBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },

  // ── Chart row ─────────────────────────────────────────────────────────────
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  legendLeft: {
    flex: 1,
    alignItems: 'center',
    paddingRight: 4,
  },
  legendRight: {
    flex: 1,
    alignItems: 'center',
    paddingLeft: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },

  // ── Center logo ───────────────────────────────────────────────────────────
  centerLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLogo: {
    width: 44,
    height: 44,
  },

  // ── Bar ───────────────────────────────────────────────────────────────────
  barCard: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barValueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  // ── Advantage ─────────────────────────────────────────────────────────────
  advCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  advRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  advDesc: {
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
