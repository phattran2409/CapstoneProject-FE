import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ThemedText } from '../themed';
import type { FormationSlot as SlotType, FormationPlayer, PositionLine } from './types';
import { getImageAvatar } from '@/shared/utils/imageSource';

/** Colors for different position lines */
const LINE_COLORS: Record<PositionLine, { bg: string; border: string; text: string }> = {
  GK: { bg: '#FFD700', border: '#FFA500', text: '#000' },
  DF: { bg: '#4169E1', border: '#1E90FF', text: '#fff' },
  MF: { bg: '#32CD32', border: '#00FF00', text: '#000' },
  FW: { bg: '#DC143C', border: '#FF4500', text: '#fff' },
};

interface FormationSlotProps {
  /** Slot configuration */
  slot: SlotType;
  /** Assigned player (if any) */
  player?: FormationPlayer | null;
  /** Whether this slot is selected */
  isSelected?: boolean;
  /** Whether a player is being dragged/selected and can be dropped here */
  isDropTarget?: boolean;
  /** Whether the slot is valid for the selected player's role */
  isValidDrop?: boolean;
  /** Slot size */
  size?: number;
  /** Called when slot is pressed */
  onPress?: (slot: SlotType) => void;
  /** Whether editing is enabled (captain only) */
  editable?: boolean;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 200,
};

const FormationSlotComponent: React.FC<FormationSlotProps> = ({
  slot,
  player,
  isSelected = false,
  isDropTarget = false,
  isValidDrop = true,
  size = 44,
  onPress,
  editable = false,
}) => {
  const scale = useSharedValue(1);
  const colors = LINE_COLORS[slot.line];
  const [avatarSource, setAvatarSource] = React.useState<ImageSourcePropType>(() =>
    getImageAvatar(player?.avatar),
  );

  React.useEffect(() => {
    setAvatarSource(getImageAvatar(player?.avatar));
  }, [player?.avatar]);

  // Pulse animation when it's a drop target (always animate, regardless of role match)
  React.useEffect(() => {
    if (isDropTarget) {
      // Always pulse when a player is selected - slot is clickable
      scale.value = withSequence(
        withTiming(1.1, { duration: 300 }),
        withTiming(1.0, { duration: 300 }),
        withTiming(1.1, { duration: 300 }),
        withTiming(1.0, { duration: 300 })
      );
    } else {
      scale.value = withSpring(isSelected ? 1.15 : 1, SPRING_CONFIG);
    }
  }, [isDropTarget, isSelected, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    console.log('[FormationSlot] handlePress called, editable:', editable, 'slot:', slot.id);
    if (editable && onPress) {
      // Animate press
      scale.value = withSequence(
        withSpring(0.9, SPRING_CONFIG),
        withSpring(1, SPRING_CONFIG)
      );
      onPress(slot);
    } else {
      console.log('[FormationSlot] Press ignored - editable:', editable, 'onPress:', !!onPress);
    }
  };

  const isEmpty = !player;

  // Get border style based on state
  const getBorderStyle = () => {
    if (isSelected) {
      return { borderColor: '#00FF66', borderWidth: 3 };
    }
    if (isDropTarget) {
      // Always show as clickable - green for match, orange for mismatch (not red - less aggressive)
      return { 
        borderColor: isValidDrop ? '#00FF66' : '#FFA500', 
        borderWidth: 2,
        borderStyle: 'dashed' as const,
      };
    }
    if (isEmpty) {
      return { 
        borderColor: 'rgba(255, 255, 255, 0.4)', 
        borderWidth: 2,
        borderStyle: 'dashed' as const,
      };
    }
    return { borderColor: colors.border, borderWidth: 2 };
  };

  const borderStyle = getBorderStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: slot.position.x as any,
          top: slot.position.y as any,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
      onTouchStart={() => console.log('[FormationSlot] Touch detected on slot:', slot.id)}
    >
      <TouchableOpacity
        style={[
          styles.slot,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: isEmpty 
              ? 'rgba(0, 0, 0, 0.5)' 
              : colors.bg,
            ...borderStyle,
          },
        ]}
        onPress={handlePress}
        onPressIn={() => console.log('[FormationSlot] PressIn on slot:', slot.id)}
        activeOpacity={editable ? 0.7 : 1}
        disabled={!editable}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {isEmpty ? (
          // Empty slot - show position label
          <View style={styles.emptyContent}>
            <ThemedText 
              size="xs" 
              weight="bold"
              style={{ color: colors.text === '#000' ? '#fff' : colors.text }}
            >
              {slot.label}
            </ThemedText>
            {editable && (
              <ThemedText 
                size="xs" 
                weight="bold"
                style={{ color: '#00FF66', marginTop: 2 }}
              >
                +
              </ThemedText>
            )}
          </View>
        ) : (
          // Player assigned - show avatar
          <>
              <Image 
                source={avatarSource}
                onError={() => setAvatarSource(getImageAvatar(undefined))}
                style={[styles.avatar, { width: size - 6, height: size - 6, borderRadius: (size - 6) / 2 }]} 
              />
          </>
        )}
      </TouchableOpacity>

      {/* Player name label */}
      {player && (
        <View style={styles.nameLabel}>
          <ThemedText 
            size="xs" 
            weight="semiBold" 
            numberOfLines={1}
            style={{ color: '#fff' }}
          >
            {player.name?.split(' ')[0]}
          </ThemedText>
        </View>
      )}

      {/* Glow effect for selected/drop target - always show when drop target to indicate clickable */}
      {(isSelected || isDropTarget) && (
        <View 
          style={[
            styles.glowRing, 
            { 
              width: size + 12, 
              height: size + 12, 
              borderRadius: (size + 12) / 2,
              borderColor: isValidDrop ? '#00FF66' : '#FFA500',
            }
          ]} 
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    // Use margin instead of transform for better touch handling
    marginLeft: -22,
    marginTop: -22,
  },
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameLabel: {
    position: 'absolute',
    bottom: -18,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    minWidth: 40,
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    opacity: 0.6,
    top: -6,
    left: -6,
  },
});

export default FormationSlotComponent;

