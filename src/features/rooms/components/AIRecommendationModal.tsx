import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/shared/components/themed';
import { useTheme } from '@/shared/theme';
import { MatchRoom, SuggestedPlayerProfile } from '../types/room.types';
import { formatMatchFormatVsLabel } from '../utils/matchFormatVsLabel';
import { getMatchFormatBadgeColor, MATCH_FORMAT_BADGE_COLORS } from '@/shared/utils/matchFormatColors';

export type AIRecommendationMode = 'match' | 'player';

export interface MatchRecommendation {
  id: string;
  title: string;
  venueName?: string;
  address?: string;
  startTime: string;
  endTime?: string;
  distanceKm?: number;
  format: string;
  missingText?: string;
  missingPlayers?: number;
  actionLabel?: string;
  secondaryActionLabel?: string;
  matchReason?: string;
}

interface AIRecommendationModalProps {
  visible: boolean;
  mode: AIRecommendationMode;
  query?: string;
  isLoading?: boolean;
  /** Lỗi gần nhất (API / mạng) — hiển thị trong modal thay vì toast để dễ thấy khi modal mở */
  errorMessage?: string | null;
  matchRecommendations?: MatchRoom[];
  playerRecommendations?: SuggestedPlayerProfile[];
  onClose: () => void;
  onChangeQuery?: (value: string) => void;
  onSubmitQuery?: () => void;
  onJoinMatch?: (recommendation: MatchRoom) => void;
  onSecondaryMatchAction?: (recommendation: MatchRoom) => void;
  onInvitePlayer?: (recommendation: SuggestedPlayerProfile) => void;
}

const formatDistance = (distanceKm?: number) => {
  if (typeof distanceKm !== 'number') return undefined;
  return `${distanceKm.toFixed(distanceKm >= 10 ? 0 : 1)}km`;
};

const formatCommunityScore = (score?: number) => {
  if (typeof score !== 'number') return '--';
  const normalized = score <= 1 ? score * 100 : score;
  return `${Math.round(Math.max(0, Math.min(normalized, 100)))}%`;
};

export const AIRecommendationModal: React.FC<AIRecommendationModalProps> = ({
  visible,
  mode,
  query,
  isLoading = false,
  errorMessage = null,
  matchRecommendations = [],
  playerRecommendations = [],
  onClose,
  onChangeQuery,
  onSubmitQuery,
  onJoinMatch,
  onSecondaryMatchAction,
  onInvitePlayer,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const accentColor = theme.colors.neonGreen;
  const isMatchMode = mode === 'match';
  const resultCount = isMatchMode ? matchRecommendations.length : playerRecommendations.length;
  const title = isMatchMode
    ? t('aiRecommendation.match.title')
    : t('aiRecommendation.player.title');
  const placeholder = isMatchMode
    ? t('aiRecommendation.match.placeholder')
    : t('aiRecommendation.player.placeholder');
  const summary = isMatchMode
    ? t('aiRecommendation.match.summary', { count: resultCount })
    : t('aiRecommendation.player.summary', { count: resultCount });
  const emptyText = isMatchMode
    ? t('aiRecommendation.match.empty')
    : t('aiRecommendation.player.empty');

  const renderMatchCard = (item: MatchRoom) => {
    const colorFormat = getMatchFormatBadgeColor(formatMatchFormatVsLabel(item.matchFormat), theme.colors.primary);
    return (
    <View
      key={item.roomId}
      style={[
        styles.card,
        styles.featuredCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={[styles.sideAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBlock}>
            <ThemedText size="l" weight="bold" numberOfLines={1}>
              {item.roomName}
            </ThemedText>
            <View style={styles.metaRow}>
              <Ionicons name="location" size={15} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" size="s" numberOfLines={1} style={styles.flexText}>
                {item.venueAddress || item.venueName || t('aiRecommendation.match.unknownVenue')}
              </ThemedText>
            </View>
          </View>
          <View
            style={[
              styles.formatBadge,
              {
                backgroundColor: `${colorFormat}18`,
                borderColor: `${colorFormat}66`,
              },
            ]}
          >
            <Ionicons name="football" size={12} color={accentColor} />
            <ThemedText size="xs" weight="bold" style={{ color: accentColor , }}>
              {formatMatchFormatVsLabel(item.matchFormat)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.infoPanel, { backgroundColor: theme.colors.darkBlack }]}>
          <View style={styles.infoRow}>
            <View style={styles.inlineInfo}>
              <Ionicons name="time" size={18} color={accentColor} />
              <ThemedText size="m" weight="semiBold">
                {item.endTime ? `${item.startTime} - ${item.endTime}` : item.startTime}
              </ThemedText>
            </View>
          </View>
          <View style={styles.metaRow}>
            <Ionicons name="people" size={17} color={theme.colors.textSecondary} />
            <ThemedText variant="secondary" size="s">
              {item.filledSlots ??
                t('aiRecommendation.match.missingPlayers', {
                  count: Math.max(item.totalSlots - item.filledSlots, 0),
                })}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.primaryButton, { backgroundColor: accentColor }]}
          onPress={() => onJoinMatch?.(item)}
        >
          <Ionicons name="add-circle" size={22} color={theme.colors.black} />
          <ThemedText size="m" weight="bold" style={{ color: theme.colors.black }}>
            {t('aiRecommendation.match.joinNow')}
          </ThemedText>
        </TouchableOpacity>

        {/* {item.secondaryActionLabel ? (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.secondaryButton,
              {
                backgroundColor: `${accentColor}18`,
                borderColor: `${accentColor}55`,
              },
            ]}
            onPress={() => onSecondaryMatchAction?.(item)}
          >
            <Ionicons name="hand-left" size={18} color={accentColor} />
            <ThemedText size="m" weight="bold" style={{ color: accentColor }}>
              {item.secondaryActionLabel}
            </ThemedText>
          </TouchableOpacity>
        ) : null} */}
      </View>
    </View>
    );
  };

  const renderPlayerCard = (item: SuggestedPlayerProfile) => (
    <View
      key={item.userId} 
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.playerHeader}>
        <View style={styles.playerIdentity}>
          {item.userAvatarUrl ? (
            <Image source={{ uri: item.userAvatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarFallback, { backgroundColor: `${accentColor}1F` }]}>
              <Ionicons name="person" size={24} color={accentColor} />
            </View>
          )}
          <View style={styles.cardTitleBlock}>
            <ThemedText size="l" weight="bold" numberOfLines={1}>
              {item.userFullName}
            </ThemedText>
          </View>
        </View>
        <View
          style={[
            styles.positionBadge,
            {
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}66`,
            },
          ]}
        >
          <ThemedText size="xs" weight="bold" style={{ color: accentColor }}>
            {item.preferredPositions}
          </ThemedText>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <MetricItem
          icon="flash"
          label={t('aiRecommendation.player.elo')}
          value={item.currentElo.toString()}
        />
        <MetricItem
          icon="trending-up"
          label={t('aiRecommendation.player.winStreak')}
          value={t('aiRecommendation.player.winStreakValue', {
            count: item.winStreak ?? 0,
          })}
        />
        <MetricItem
          icon="heart"
          label={t('aiRecommendation.player.community')}
          value={formatCommunityScore(item.trustScore)}
        />
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.primaryButton, { backgroundColor: accentColor }]}
        onPress={() => onInvitePlayer?.(item)}
      >
        <Ionicons name="person-add" size={20} color={theme.colors.black} />
        <ThemedText size="m" weight="bold" style={{ color: theme.colors.black }}>
          {t('aiRecommendation.player.inviteNow')}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );

  const MetricItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string;
  }) => (
    <View style={[styles.metricItem, { backgroundColor: theme.colors.darkBlack }]}>
      <Ionicons name={icon} size={16} color={accentColor} />
      <ThemedText size="xs" variant="secondary">
        {label}
      </ThemedText>
      <ThemedText size="s" weight="bold">
        {value}
      </ThemedText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.colors.background,
                borderColor: theme.colors.border,
              },
            ]}
          >
            <View style={styles.handleWrap}>
              <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.headerTitleRow}>
                <Ionicons name="hardware-chip" size={24} color={accentColor} />
                <ThemedText size="xl" weight="bold" style={styles.headerTitle}>
                  {title}
                </ThemedText>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
              >
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.searchBox,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: `${accentColor}8A`,
                  shadowColor: accentColor,
                },
              ]}
            >
              <Ionicons name="sparkles" size={24} color={accentColor} />
              <TextInput
                value={query}
                onChangeText={onChangeQuery}
                placeholder={placeholder}
                placeholderTextColor={theme.colors.textSecondary}
                style={[styles.input, { color: theme.colors.text }]}
                multiline
                returnKeyType="send"
                onSubmitEditing={onSubmitQuery}
              />
              <TouchableOpacity
                activeOpacity={0.85}
                style={[
                  styles.submitButton,
                  {
                    backgroundColor: accentColor,
                    opacity: isLoading ? 0.7 : 1,
                  },
                ]}
                disabled={isLoading}
                onPress={onSubmitQuery}
              >
                <Ionicons name="send" size={20} color={theme.colors.black} />
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <Ionicons
                name={isLoading ? 'sync' : 'swap-horizontal'}
                size={22}
                color={accentColor}
              />
              <ThemedText size="s" weight="medium" style={{ color: accentColor }}>
                {isLoading ? t('aiRecommendation.searching') : summary}
              </ThemedText>
            </View>

            {errorMessage && !isLoading ? (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: `${theme.colors.error}22`,
                    borderColor: theme.colors.error,
                  },
                ]}
              >
                <Ionicons name="alert-circle" size={22} color={theme.colors.error} />
                <ThemedText
                  size="s"
                  style={[styles.errorBannerText, { color: theme.colors.text }]}
                >
                  {errorMessage}
                </ThemedText>
              </View>
            ) : null}

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            >
              {resultCount === 0 && !isLoading && !errorMessage ? (
                <View style={[styles.emptyBox, { borderColor: theme.colors.border }]}>
                  <Ionicons name="sparkles" size={28} color={accentColor} />
                  <ThemedText variant="secondary" size="s" style={styles.emptyText}>
                    {emptyText}
                  </ThemedText>
                </View>
              ) : null}
              {isMatchMode
                ? matchRecommendations.map((item) => renderMatchCard(item))
                : playerRecommendations.map(renderPlayerCard)}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    width: '100%',
  },
  sheet: {
    maxHeight: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 56,
    height: 5,
    borderRadius: 999,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 24,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7,
  },
  input: {
    flex: 1,
    minHeight: 42,
    maxHeight: 78,
    fontSize: 15,
    fontWeight: '600',
    paddingVertical: 0,
  },
  submitButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 14,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 20,
    marginTop: -4,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    lineHeight: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },
  featuredCard: {
    flexDirection: 'row',
    padding: 0,
    overflow: 'hidden',
  },
  sideAccent: {
    width: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 5,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  flexText: {
    flex: 1,
  },
  formatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoPanel: {
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  inlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  reasonText: {
    lineHeight: 17,
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButton: {
    minHeight: 50,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  playerIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  positionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  metricItem: {
    width: '47%',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  emptyBox: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    gap: 10,
  },
  emptyText: {
    textAlign: 'center',
  },
});

export default AIRecommendationModal;
