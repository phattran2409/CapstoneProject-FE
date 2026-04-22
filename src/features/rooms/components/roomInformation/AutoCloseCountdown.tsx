import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import { useTranslation } from 'react-i18next';

interface AutoCloseCountdownProps {
  /** Số giây còn lại nhận từ server (source of truth) */
  secondsRemaining: number;
  /** Thời điểm server phát tick gần nhất (để tính drift) */
  tickAt: string;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const formatMmSs = (totalSeconds: number): string => {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${pad(minutes)}:${pad(seconds)}`;
};

/**
 * Hiển thị countdown auto-close room dựa trên tick từ SignalR.
 *
 * Logic:
 * - `secondsRemaining` từ server là source of truth: khi nhận tick mới thì reset local timer.
 * - Local interval chỉ decrement 1s/giây giữa 2 tick để UI mượt.
 * - Nếu `secondsRemaining <= 0` thì hiển thị 00:00 và dừng.
 */
export const AutoCloseCountdown: React.FC<AutoCloseCountdownProps> = ({
  secondsRemaining,
  tickAt,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [localSeconds, setLocalSeconds] = useState(secondsRemaining);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Reset local timer mỗi khi server gửi tick mới
  useEffect(() => {
    setLocalSeconds(secondsRemaining);
  }, [secondsRemaining, tickAt]);

  // Decrement local timer mỗi giây giữa 2 tick server
  useEffect(() => {
    if (localSeconds <= 0) return;

    const interval = setInterval(() => {
      setLocalSeconds((prev) => {
        const next = prev - 1;
        return next > 0 ? next : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [localSeconds <= 0]);

  // Pulse animation trong 30s cuối
  useEffect(() => {
    if (localSeconds > 30) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [localSeconds <= 30]);

  const isUrgent = localSeconds <= 60;
  const accentColor = isUrgent ? theme.colors.error ?? '#ef4444' : theme.colors.warning ?? '#f59e0b';

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: accentColor + '18',
            borderColor: accentColor,
          },
          localSeconds <= 30 && { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <ThemedText
          size="xs"
          weight="medium"
          style={[styles.label, { color: accentColor }]}
        >
          {t('roomDetail.autoClose.label')}
        </ThemedText>
        <ThemedText
          size="xxl"
          weight="bold"
          style={[styles.timer, { color: accentColor }]}
        >
          {formatMmSs(localSeconds)}
        </ThemedText>
        <ThemedText
          size="xs"
          style={[styles.hint, { color: theme.colors.textSecondary }]}
        >
          {t('roomDetail.autoClose.hint')}
        </ThemedText>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  timer: {
    letterSpacing: 1.4,
    marginVertical: 2,
  },
  hint: {
    marginTop: 2,
    textAlign: 'center',
  },
});

export default AutoCloseCountdown;
