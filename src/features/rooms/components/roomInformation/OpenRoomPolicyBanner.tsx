import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedText, ThemedView } from '@/shared/components/themed';
import type { Theme } from '@/shared/theme';

interface OpenRoomPolicyBannerProps {
  theme: Theme;
  t: (key: string, options?: Record<string, unknown>) => string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  deadlineLabel: string;
  ruleLabel: string;
}
const themeColor = (theme: Theme) => {
  return {
     neonGreen: {
      line: `${theme.colors.neonGreen}55`,
      badgeBg: `${theme.colors.neonGreen}20`,
      badgeBorder: `${theme.colors.neonGreen}99`,
      cardBg: `${theme.colors.neonGreen}aa`,
    },
    orange: {
      line: `${theme.colors.blueSky}55`,
      badgeBg: `${theme.colors.blueSky}20`,
      badgeBorder: `${theme.colors.blueSky}99`,
      cardBg: `${theme.colors.blueSky}`,
    },
  };
};

export const OpenRoomPolicyBanner: React.FC<OpenRoomPolicyBannerProps> = ({
  theme,
  t,
  isExpanded,
  onToggleExpanded,
  deadlineLabel,
  ruleLabel,
}) => {
  const neon = theme.colors.neonGreen;
  const lineColor_neon = `${neon}55`;
  const badgeBg_neon = `${neon}20`;
  const badgeBorder_neon = `${neon}99`;
  const cardBgMuted = `${theme.colors.card}ee`;

  return (
    <ThemedView
      style={[
        styles.banner,
        {
          backgroundColor: `${neon}16`,
          borderColor: `${neon}55`,
          borderLeftColor: neon,
        },
      ]}
    >
      <View style={styles.bannerText}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={onToggleExpanded}
          accessibilityRole="button"
          accessibilityLabel={t('roomDetail.openRoomPolicyTitle')}
        >
          <View
            style={[
              styles.headerIcon,
              {
                borderColor: `${neon}90`,
                backgroundColor: `${neon}16`,
              },
            ]}
          >
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={14}
              color={neon}
            />
          </View>
          <ThemedText size="m" weight="bold" style={{ color: neon }}>
            {t('roomDetail.openRoomPolicyTitle')}
          </ThemedText>
        </TouchableOpacity>

        {isExpanded && (
          <>
            <View style={styles.timeline}>
              <View style={[styles.timelineRow, { gap: 12 }]}>
                <View style={styles.badgeColumn}>
                  <View
                    style={[
                      styles.badge,
                      { borderColor: themeColor(theme).neonGreen.badgeBorder, backgroundColor: themeColor(theme).neonGreen.badgeBg   },
                    ]}
                  >
                    <ThemedText size="xs" weight="bold" style={{ color: neon }}>
                      1
                    </ThemedText>
                  </View>
                  <View style={styles.connectorRow}>
                    <View style={styles.connectorLineWrap}>
                      <View
                        style={[
                          styles.connectorLine,
                          { minHeight: 60 },
                          { backgroundColor: lineColor_neon, height: 16 },
                        ]}
                      />
                    </View>
                    <View style={{ flex: 1 }} />
                  </View>
                </View>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: `${badgeBg_neon}aa`,
                      borderColor: `${neon}44`,
                    },
                  ]}
                >
                  <ThemedText variant="secondary" size="xs" style={styles.cardLabel}>
                    {t('roomDetail.openRoomPolicyStepDeadlineLabel')}
                  </ThemedText>
                  <ThemedText weight="bold" size="m" style={{ color: neon }}>
                    {deadlineLabel || '-'}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.connectorRow}>
                <View style={styles.connectorLineWrap}>
                  <View
                    style={[
                      styles.connectorLine,
                    ]}
                  />
                </View>
                <View style={{ flex: 1 }} />
              </View>

              <View style={[styles.timelineRow, { gap: 12 }]}>
                <View style={styles.badgeColumn}>
                  <View
                    style={[
                      styles.badge,
                      { borderColor: themeColor(theme).orange.badgeBorder, backgroundColor: themeColor(theme).orange.badgeBg },
                    ]}
                  >
                    <ThemedText size="xs" weight="bold" style={{ color: themeColor(theme).orange.cardBg }}>
                      2
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={[
                    styles.card,
                    {
                      backgroundColor: `${themeColor(theme).orange.cardBg}20`,
                      borderColor: `${themeColor(theme).orange.badgeBorder}`,
                    },
                  ]}
                >
                  <ThemedText variant="secondary" size="xs" style={styles.cardLabel}>
                    {t('roomDetail.openRoomPolicyStepRuleLabel')}
                  </ThemedText>
                  <ThemedText variant="primary" size="s" style={styles.ruleText}>
                    {ruleLabel || '-'}
                  </ThemedText>
                </View>
              </View>
            </View>

            <ThemedText variant="primary" size="s" style={styles.explanation}>
              {t('roomDetail.openRoomPolicyExplanation')}
            </ThemedText>
          </>
        )}
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 16,
    gap: 12,
    position: 'relative',
  },
  bannerText: {
    flex: 1,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeline: {
    marginTop: 8,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  badgeColumn: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 6,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  cardLabel: {
    marginBottom: 6,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  connectorLineWrap: {
    width: 36,
    alignItems: 'center',
    paddingVertical: 4,
  },
  connectorLine: {
    width: 2,
    borderRadius: 1,
    minHeight: 20,
  },
  ruleText: {
    lineHeight: 20,
  },
  explanation: {
    lineHeight: 20,
    marginTop: 14,
  },
});
