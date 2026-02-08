import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { ThemedText, ThemedIcon } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { TeamAssignment } from '../types/room.types';

// Position types
export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

interface PositionOption {
  id: PlayerPosition;
  label: string;
  fullLabel: string;
  icon: string;
  color: string;
  description: string;
}

const POSITIONS: PositionOption[] = [
  {
    id: 'GK',
    label: 'GK',
    fullLabel: 'Goalkeeper',
    icon: 'hand-left',
    color: '#FFB300', // Amber
    description: 'Thủ môn - Bảo vệ khung thành',
  },
  {
    id: 'DF',
    label: 'DF',
    fullLabel: 'Defender',
    icon: 'shield',
    color: '#2196F3', // Blue
    description: 'Hậu vệ - Phòng ngự',
  },
  {
    id: 'MF',
    label: 'MF',
    fullLabel: 'Midfielder',
    icon: 'sync',
    color: '#4CAF50', // Green
    description: 'Tiền vệ - Kết nối các tuyến',
  },
  {
    id: 'FW',
    label: 'FW',
    fullLabel: 'Forward',
    icon: 'flash',
    color: '#F44336', // Red
    description: 'Tiền đạo - Tấn công ghi bàn',
  },
];

interface PositionSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectPosition: (position: PlayerPosition) => void;
  teamAssignment: TeamAssignment;
  isLoading?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const PositionSelectionModal: React.FC<PositionSelectionModalProps> = ({
  visible,
  onClose,
  onSelectPosition,
  teamAssignment,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide up
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
      // Slide down
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

  const teamLabel = teamAssignment === 'A' ? 'Team A' : 'Team B';
  const teamColor = teamAssignment === 'A' ? '#4CAF50' : '#2196F3';

  const handleSelectPosition = (position: PlayerPosition) => {
    if (!isLoading) {
      onSelectPosition(position);
    }
  };

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
        {/* Handle Bar */}
        <View style={styles.handleBarContainer}>
          <View style={[styles.handleBar, { backgroundColor: theme.colors.border }]} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText size="xl" weight="bold">
              Chọn vị trí
            </ThemedText>
            <View style={[styles.teamBadge, { backgroundColor: teamColor + '20' }]}>
              <ThemedText size="s" weight="bold" style={{ color: teamColor }}>
                {teamLabel}
              </ThemedText>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <ThemedText variant="secondary" size="s" style={styles.description}>
          Chọn vị trí bạn muốn chơi trong trận đấu này
        </ThemedText>

        {/* Position Grid */}
        <View style={styles.positionGrid}>
          {POSITIONS.map((position) => (
            <TouchableOpacity
              key={position.id}
              style={[
                styles.positionCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => handleSelectPosition(position.id)}
              disabled={isLoading}
            >
              {/* Position Icon */}
              <View
                style={[
                  styles.positionIconContainer,
                  { backgroundColor: position.color + '20' },
                ]}
              >
                <Ionicons name={position.icon as any} size={32} color={position.color} />
              </View>

              {/* Position Label */}
              <View style={[styles.positionLabelBadge, { backgroundColor: position.color }]}>
                <ThemedText size="m" weight="bold" style={{ color: '#fff' }}>
                  {position.label}
                </ThemedText>
              </View>

              {/* Full Label */}
              <ThemedText size="s" weight="semiBold" style={styles.positionFullLabel}>
                {position.fullLabel}
              </ThemedText>

              {/* Description */}
              <ThemedText
                variant="secondary"
                size="xs"
                style={styles.positionDescription}
                numberOfLines={2}
              >
                {position.description}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading Indicator */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingContainer, { backgroundColor: theme.colors.surface }]}>
              <ThemedIcon name="hourglass" size={24} variant="accent" />
              <ThemedText size="s" weight="medium" style={{ marginLeft: 8 }}>
                Đang tham gia...
              </ThemedText>
            </View>
          </View>
        )}

        {/* Cancel Button */}
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.border }]}
          onPress={onClose}
          disabled={isLoading}
        >
          <ThemedText variant="secondary" weight="medium">
            Hủy
          </ThemedText>
        </TouchableOpacity>
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
    marginBottom: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  teamBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    marginBottom: 20,
  },
  positionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  positionCard: {
    width: '47%',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  positionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  positionLabelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  positionFullLabel: {
    marginBottom: 4,
  },
  positionDescription: {
    textAlign: 'center',
    lineHeight: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
});
