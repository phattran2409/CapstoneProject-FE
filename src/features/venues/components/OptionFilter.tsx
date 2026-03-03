import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';

const RADIUS_OPTIONS = [5, 10, 20] as const;
type RadiusKm = (typeof RADIUS_OPTIONS)[number];

const MODAL_PADDING = 24;

export interface OptionFilterProps {
  visible: boolean;
  initialRadiusKm: number | null;
  onClose: () => void;
  onApply: (radiusKm: number) => void;
}

const OptionFilter: React.FC<OptionFilterProps> = ({
  visible,
  initialRadiusKm,
  onClose,
  onApply,
}) => {
  const { theme } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);
  const [radiusKm, setRadiusKm] = useState<RadiusKm>(
    initialRadiusKm && RADIUS_OPTIONS.includes(initialRadiusKm as RadiusKm)
      ? (initialRadiusKm as RadiusKm)
      : 10
  );

  const index = RADIUS_OPTIONS.indexOf(radiusKm);
  const thumbPosition = index / (RADIUS_OPTIONS.length - 1);

  const updateRadiusFromX = useCallback(
    (x: number) => {
      if (trackWidth <= 0) return;
      const segmentWidth = trackWidth / (RADIUS_OPTIONS.length - 1);
      const rawIndex = x / segmentWidth;
      const nearestIndex = Math.round(rawIndex);
      const clampedIndex = Math.max(0, Math.min(nearestIndex, RADIUS_OPTIONS.length - 1));
      setRadiusKm(RADIUS_OPTIONS[clampedIndex]);
    },
    [trackWidth]
  );

  const handleApply = useCallback(() => {
    console.log('Radius km', radiusKm);
    onApply(radiusKm);
    onClose();
  }, [radiusKm, onApply, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.modalBox,
            {
              backgroundColor: theme.colors.surface || '#1a1a1a',
              borderRadius: theme.radius.l,
              borderColor: '#2a2a2a',
            },
          ]}
        >
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: '#2a2a2a' }]}>
            <Text style={[styles.title, { color: theme.colors.softWhite }]}>
              Bán kính (km)
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Slider: thanh trượt với 3 mức 5, 10, 20 km (kéo trực tiếp trên thanh) */}
          <View style={styles.sliderSection}>
            <View
              style={[
                styles.track,
                {
                  backgroundColor: '#2a2a2a',
                  borderRadius: theme.radius.m,
                },
              ]}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              onStartShouldSetResponder={() => true}
              onResponderMove={(e) => updateRadiusFromX(e.nativeEvent.locationX)}
              onResponderRelease={(e) => updateRadiusFromX(e.nativeEvent.locationX)}
            >
              <View
                style={[
                  styles.trackFill,
                  {
                    width: `${thumbPosition * 100}%`,
                    backgroundColor: theme.colors.neonGreen,
                    borderTopLeftRadius: theme.radius.m,
                    borderBottomLeftRadius: theme.radius.m,
                  },
                ]}
              />
              <View
                style={[
                  styles.thumb,
                  {
                    left: `${thumbPosition * 100}%`,
                    backgroundColor: theme.colors.neonGreen,
                    borderRadius: theme.radius.round,
                    borderColor: theme.colors.softWhite,
                  },
                ]}
              />
            </View>
            <View style={styles.labels}>
              {RADIUS_OPTIONS.map((km) => (
                <Text
                  key={km}
                  style={[
                    styles.label,
                    {
                      color:
                        radiusKm === km
                          ? theme.colors.neonGreen
                          : theme.colors.textSecondary,
                      fontWeight: radiusKm === km ? '700' : '400',
                    },
                  ]}
                >
                  {km} km
                </Text>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={[styles.footer, { gap: theme.spacing.m }]}>
            <TouchableOpacity
              style={[
                styles.cancelBtn,
                {
                  backgroundColor: '#2a2a2a',
                  borderRadius: theme.radius.m,
                  paddingVertical: theme.spacing.m,
                },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyBtn,
                {
                  backgroundColor: theme.colors.neonGreen,
                  borderRadius: theme.radius.m,
                  paddingVertical: theme.spacing.m,
                },
              ]}
              onPress={handleApply}
            >
              <Text style={[styles.applyText, { color: theme.colors.darkBlack }]}>
                Áp dụng
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: MODAL_PADDING,
  },
  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sliderSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  track: {
    height: 8,
    width: '100%',
    position: 'relative',
    overflow: 'visible',
  },
  trackFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    top: -6,
    width: 20,
    height: 20,
    marginLeft: -10,
    borderWidth: 2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OptionFilter;
