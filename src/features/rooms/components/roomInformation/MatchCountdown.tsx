import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed';
import type { MatchRoomStatus } from '@/features/rooms';

type MatchCountdownVariant = 'inline' | 'overlay';

interface MatchCountdownProps {
  matchDate: string;
  startTime: string;
  endTime: string;
  status: MatchRoomStatus;
  /**
   * inline: hiển thị như một block bên dưới header
   * overlay: full-screen overlay với nền trong suốt
   */
  variant?: MatchCountdownVariant;
}

const MS_PER_SECOND = 1000;

const parseTimeToDate = (dateString: string, timeString: string) => {
  const date = new Date(dateString);

  if (!timeString) {
    return date;
  }

  const [hh, mm] = timeString.split(':').map(Number);

  if (!Number.isFinite(hh) || !Number.isFinite(mm)) {
    return date;
  }

  date.setHours(hh, mm, 0, 0);
  return date;
};

const formatDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return '00:00';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
};

// nếu locked là lấy thời gian bây giờ đến khi bắt đầu trận thì chuyền endTime là startTime
// nếu InProgress là lấy thời gian bây giờ đến khi kết thúc trận thì chuyền endTime là endTime

export const MatchCountdown: React.FC<MatchCountdownProps> = ({
  matchDate,
  startTime,
  endTime,
  status,
  variant = 'inline',
}) => {
  const { theme } = useTheme();

  const [remainingMs, setRemainingMs] = useState(() => {
    const endDate = parseTimeToDate(matchDate, endTime);
    return Math.max(0, endDate.getTime() - Date.now());
  });

  
  const isActive = status === 'InProgress' || status === 'Locked' && remainingMs > 0;

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setRemainingMs((prev) => {
        const next = prev - MS_PER_SECOND;
        return next > 0 ? next : 0;
      });
    }, MS_PER_SECOND);

    return () => clearInterval(interval);
  }, [isActive]);

  const remainingSeconds = useMemo(
    () => Math.max(0, Math.floor(remainingMs / MS_PER_SECOND)),
    [remainingMs],
  );
  const timeLabel = useMemo(
    () => formatDuration(remainingSeconds),
    [remainingSeconds],
  );
  // Nếu không active thì không render gì để tránh layout nhấp nháy
  if (!isActive) {
    return null;
  }
  
  if (variant === 'overlay') {
    return (
      <View style={[StyleSheet.absoluteFillObject, styles.overlayContainer]}>
        <View
          style={[
            styles.countdownBubble,
            {
              backgroundColor: theme.colors.background + 'D0',
              borderColor: theme.colors.neonGreen,
            },
          ]}
        >
          <ThemedText
            size="s"
            weight="medium"
            style={[styles.caption, { color: theme.colors.textSecondary }]}
          >
            Thời gian còn lại
          </ThemedText>
          <ThemedText
            size="xxl"
            weight="bold"
            style={[styles.timeText, { color: theme.colors.neonGreen }]}
          >
            {timeLabel}
          </ThemedText>
        </View>
      </View>
    );
  }

  // Mặc định: hiển thị inline ngay dưới header
  return (
    <View style={styles.inlineWrapper}>
      <View
        style={[
          styles.inlineContainer,
          {
            backgroundColor: theme.colors.neonGreen + '22',
            borderColor: theme.colors.neonGreen,
          },
        ]}
      >
        <View style={styles.inlineTextBlock}>
          <ThemedText
            size="xs"
            weight="medium"
            style={[styles.caption, { color: theme.colors.textSecondary }]}
          >
            Thời gian trận đấu còn lại
          </ThemedText>
          <ThemedText
            size="xxl"
            weight="bold"
            style={[styles.timeText, { color: theme.colors.neonGreen }]}
          >
            {timeLabel}
          </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inlineWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  inlineContainer: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inlineTextBlock: {
    alignItems: 'center',
  },
  caption: {
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  timeText: {
    letterSpacing: 1.2,
  },
  overlayContainer: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  countdownBubble: {
    paddingHorizontal: 36,
    paddingVertical: 24,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MatchCountdown;

