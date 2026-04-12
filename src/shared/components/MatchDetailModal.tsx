/**
 * MatchDetailModal Component
 * Modal để xem chi tiết match nhanh
 */

import React from 'react';
import { View, TouchableOpacity, Modal, Image, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText, ThemedIcon, ThemedView } from '@/shared/components/themed';
import { MatchItemData } from './MatchItem';
import { getImageSource } from '../utils/imageSource';
import { matchRoomStatusI18nKey } from '../utils/matchRoomStatus';
import { MatchRoomStatusIcon } from './MatchRoomStatusIcon';
import { useTranslation } from 'react-i18next';

export interface MatchDetailModalProps {
  visible: boolean;
  match: MatchItemData | null;
  onClose: () => void;
  onViewDetail?: (matchId: string) => void;
}

const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  visible,
  match,
  onClose,
  onViewDetail,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  if (!match) return null;

  const detailIconColor = theme.colors.textSecondary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={[styles.backdrop, { backgroundColor: theme.colors.overlay }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: theme.radius.xl,
              borderTopRightRadius: theme.radius.xl,
            }
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.modalHeader,
              {
                borderBottomColor: theme.colors.border,
              }
            ]}
          >
            <ThemedText size="xl" weight="bold">
                {t("matches.detailModal.title")}
            </ThemedText>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
            >
              <ThemedIcon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalBody}
          >
            {/* Match Image */}
            <Image
              source={getImageSource(match.image)}
              style={styles.matchImage}
              resizeMode="cover"
            />

            {/* Match Info */}
            <View style={styles.matchInfo}>
              <ThemedText size="xxl" weight="bold" style={styles.matchTitle}>
                {match.title}
              </ThemedText>

              {/* Status */}
              {match.status && (
                <View style={styles.statusContainer}>
                  <MatchRoomStatusIcon status={match.status} />
                  <ThemedText size="m" weight="semiBold" style={styles.statusText}>
                    {t(matchRoomStatusI18nKey(match.status))}
                  </ThemedText>
                </View>
              )}

              {/* Details */}
              <View style={styles.detailsContainer}>
                {match.date && (
                  <View style={styles.detailRow}>
                    <ThemedIcon
                      name="calendar"
                      size={20}
                      color={detailIconColor}
                    />
                    <ThemedText variant="secondary" size="m" style={styles.detailText}>
                      {match.date}
                    </ThemedText>
                  </View>
                )}

                {match.time && (
                  <View style={styles.detailRow}>
                    <ThemedIcon name="time" size={20} color={detailIconColor} />
                    <ThemedText variant="secondary" size="m" style={styles.detailText}>
                      {match.time}
                    </ThemedText>
                  </View>
                )}

                {match.format && (
                  <View style={styles.detailRow}>
                    <ThemedIcon
                      name="people"
                      size={20}
                      color={detailIconColor}
                    />
                    <ThemedText variant="secondary" size="m" style={styles.detailText}>
                      {match.format}
                    </ThemedText>
                  </View>
                )}

                {match.players && (
                  <View style={styles.detailRow}>
                    <ThemedIcon
                      name="person"
                      size={20}
                      color={detailIconColor}
                    />
                    <ThemedText variant="secondary" size="m" style={styles.detailText}>
                      {match.players} {t("common.players")}
                    </ThemedText>
                  </View>
                )}

                {match.venue && (
                  <View style={styles.detailRow}>
                    <ThemedIcon
                      name="location"
                      size={20}
                      color={detailIconColor}
                    />
                    <ThemedText variant="secondary" size="m" style={styles.detailText}>
                      {match.venue}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={[
              styles.modalFooter,
              {
                borderTopColor: theme.colors.border,
              }
            ]}
          >
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                }
              ]}
              onPress={onClose}
            >
              <ThemedText size="m" weight="semiBold">
                {t("common.buttons.close")}
              </ThemedText>
            </TouchableOpacity>
            {onViewDetail && (
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.primaryButton,
                  {
                    backgroundColor: theme.colors.neonGreen,
                  }
                ]}
                onPress={() => {
                  onViewDetail(match.id);
                  onClose();
                }}
              >
                <ThemedText
                  size="m"
                  weight="bold"
                  style={{ color: theme.colors.darkBlack }}
                >
                  {t("common.buttons.viewDetail")}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    maxHeight: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
  },
  matchImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  matchInfo: {
    gap: 16,
  },
  matchTitle: {
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    marginLeft: 4,
  },
  detailsContainer: {
    gap: 12,
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    marginLeft: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    borderWidth: 0,
  },
});

export default MatchDetailModal;














