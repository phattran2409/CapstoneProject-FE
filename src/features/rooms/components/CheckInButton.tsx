import React, { useCallback, useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { ThemedText, ThemedView } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCheckIn } from '../hooks/useCheckIn';

interface CheckInButtonProps {
  roomId: string;
  /** Đã check-in thành công trước đó chưa */
  hasCheckedIn?: boolean;
  /** Khoảng cách từ venue (mét) – hiện nếu đã check-in */
  distanceFromVenueMeters?: number | null;
}

/**
 * Nút điểm danh GPS tại sân (optional – user có thể bỏ qua).
 * Hiện trước 30 phút khi trận sắp bắt đầu.
 */
export const CheckInButton: React.FC<CheckInButtonProps> = ({
  roomId,
  hasCheckedIn = false,
  distanceFromVenueMeters,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const { mutate: doCheckIn, isPending } = useCheckIn();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tooFarDistance, setTooFarDistance] = useState<number | null>(null);

  const handlePressCheckIn = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setTooFarDistance(null);
    setShowConfirmModal(true);
  };

  const handleConfirmCheckIn = useCallback(async () => {
    setShowConfirmModal(false);

    // Xin quyền vị trí
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMessage(t('checkIn.errors.locationPermissionDenied'));
      return;
    }

    let location: Location.LocationObject;
    try {
      location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
    } catch {
      setErrorMessage(t('checkIn.errors.locationUnavailable'));
      return;
    }

    const { latitude, longitude } = location.coords;

    doCheckIn(
      { roomId, payload: { latitude, longitude } },
      {
        onSuccess: (res: any) => {
          if (res?.alreadyCheckedIn) {
            setSuccessMessage(t('checkIn.alreadyCheckedIn'));
          } else {
            setSuccessMessage(
              t('checkIn.success', {
                distance: Math.round(res?.distanceFromVenueMeters ?? 0),
              }),
            );
          }
        },
        onError: (error: any) => {
          const code: string = error?.code ?? '';
          const msg: string = error?.message ?? '';

          if (code === 'TooFarFromVenueGpsOnly' || msg.includes('TooFarFromVenueGpsOnly')) {
            // Thử lấy khoảng cách từ message (nếu BE gửi kèm)
            const distanceMatch = msg.match(/(\d+(?:\.\d+)?)\s*m/i);
            const dist = distanceMatch ? parseFloat(distanceMatch[1]) : null;
            setTooFarDistance(dist);
            setErrorMessage(null);
          } else if (code === 'VenueLocationMissing' || msg.includes('VenueLocationMissing')) {
            setErrorMessage(t('checkIn.errors.venueLocationMissing'));
          } else if (code === 'Cancelled' || msg.toLowerCase().includes('cancelled')) {
            setErrorMessage(t('checkIn.errors.roomCancelled'));
          } else {
            setErrorMessage(t('checkIn.errors.generic'));
          }
        },
      },
    );
  }, [roomId, doCheckIn, t]);

  const handleSkip = () => {
    setShowConfirmModal(false);
  };

  // === Render states ===

  // Đã check-in thành công
  if (hasCheckedIn) {
    return (
      <View
        style={[
          styles.checkedInBadge,
          { backgroundColor: theme.colors.neonGreen + '22', borderColor: theme.colors.neonGreen },
        ]}
      >
        <Ionicons name="checkmark-circle" size={18} color={theme.colors.neonGreen} />
        <ThemedText
          size="s"
          weight="bold"
          style={{ color: theme.colors.neonGreen, marginLeft: 6 }}
        >
          {distanceFromVenueMeters != null
            ? t('checkIn.checkedInWithDistance', {
                distance: Math.round(distanceFromVenueMeters),
              })
            : t('checkIn.checkedIn')}
        </ThemedText>
      </View>
    );
  }

  return (
    <>
      {/* Khu vực hiển thị thông báo kết quả */}
      {(successMessage || errorMessage || tooFarDistance !== null) && (
        <View style={styles.resultContainer}>
          {successMessage && (
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: theme.colors.neonGreen + '22',
                  borderColor: theme.colors.neonGreen,
                },
              ]}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color={theme.colors.neonGreen} />
              <ThemedText size="s" style={{ color: theme.colors.neonGreen, marginLeft: 6, flex: 1 }}>
                {successMessage}
              </ThemedText>
            </View>
          )}
          {tooFarDistance !== null && (
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: '#ef444422',
                  borderColor: '#ef4444',
                },
              ]}
            >
              <Ionicons name="location-outline" size={16} color="#ef4444" />
              <ThemedText size="s" style={{ color: '#ef4444', marginLeft: 6, flex: 1 }}>
                {t('checkIn.errors.tooFar', {
                  distance: Math.round(tooFarDistance),
                })}
              </ThemedText>
            </View>
          )}
          {errorMessage && !tooFarDistance && (
            <View
              style={[
                styles.resultBanner,
                {
                  backgroundColor: '#ef444422',
                  borderColor: '#ef4444',
                },
              ]}
            >
              <Ionicons name="alert-circle-outline" size={16} color="#ef4444" />
              <ThemedText size="s" style={{ color: '#ef4444', marginLeft: 6, flex: 1 }}>
                {errorMessage}
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Hint — quy tắc điểm danh */}
      <View
        style={[
          styles.hintBanner,
          {
            backgroundColor: theme.colors.card ?? theme.colors.background,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Ionicons name="information-circle-outline" size={15} color={theme.colors.textSecondary} style={{ marginTop: 1 }} />
        <ThemedText variant="secondary" size="xs" style={styles.hintText}>
          {t('checkIn.hint', { minutes: 30 })}
        </ThemedText>
      </View>

      {/* Nút điểm danh */}
      <TouchableOpacity
        onPress={handlePressCheckIn}
        disabled={isPending}
        style={[
          styles.checkInButton,
          {
            backgroundColor: theme.colors.neonGreen + '18',
            borderColor: theme.colors.neonGreen,
          },
        ]}
        accessibilityLabel={t('checkIn.buttonLabel')}
      >
        {isPending ? (
          <ActivityIndicator size="small" color={theme.colors.neonGreen} />
        ) : (
          <Ionicons name="location" size={18} color={theme.colors.neonGreen} />
        )}
        <ThemedText
          size="m"
          weight="bold"
          style={{ color: theme.colors.neonGreen, marginLeft: 8 }}
        >
          {isPending ? t('checkIn.loading') : t('checkIn.button')}
        </ThemedText>
      </TouchableOpacity>

      {/* Modal xác nhận / bỏ qua */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.overlay}>
          <ThemedView
            style={[
              styles.modalCard,
              { borderColor: theme.colors.border },
            ]}
          >
            {/* Icon */}
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.neonGreen + '22' },
              ]}
            >
              <Ionicons name="location" size={32} color={theme.colors.neonGreen} />
            </View>

            <ThemedText size="l" weight="bold" style={styles.modalTitle}>
              {t('checkIn.modalTitle')}
            </ThemedText>

            <ThemedText variant="secondary" size="s" style={styles.modalBody}>
              {t('checkIn.modalBody')}
            </ThemedText>

            <ThemedText variant="secondary" size="xs" style={styles.modalNote}>
              {t('checkIn.modalNote')}
            </ThemedText>

            {/* Confirm */}
            <TouchableOpacity
              onPress={handleConfirmCheckIn}
              style={[
                styles.confirmButton,
                { backgroundColor: theme.colors.neonGreen },
              ]}
            >
              <Ionicons name="location" size={16} color="#000" />
              <ThemedText weight="bold" size="m" style={{ color: '#000', marginLeft: 6 }}>
                {t('checkIn.confirmButton')}
              </ThemedText>
            </TouchableOpacity>

            {/* Skip */}
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <ThemedText variant="secondary" size="s">
                {t('checkIn.skipButton')}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  checkedInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resultContainer: {
    gap: 6,
    marginTop: 8,
  },
  resultBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    width: '100%',
    maxWidth: 360,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBody: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  modalNote: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    fontStyle: 'italic',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginTop: 8,
    gap: 6,
  },
  hintText: {
    flex: 1,
    lineHeight: 17,
  },
});

export default CheckInButton;
