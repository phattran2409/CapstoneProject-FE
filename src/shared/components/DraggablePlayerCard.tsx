import React, { useCallback, useRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  PanResponder,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { ThemedText } from './themed';

export type DraggablePlayer = {
  id: string;
  name?: string;
  avatar?: any;
};

export interface DraggablePlayerCardProps {
  player: DraggablePlayer;
  /** Initial position in pixels */
  initialPosition: { x: number; y: number };
  /** Container bounds for clamping */
  containerSize: { width: number; height: number };
  /** Called when player is tapped (not dragged) */
  onPress?: (player: DraggablePlayer) => void;
  /** Called when player position changes after drag */
  onPositionChange?: (player: DraggablePlayer, position: { x: number; y: number }) => void;
  /** Called when drag starts */
  onDragStart?: (player: DraggablePlayer) => void;
  /** Called when drag ends */
  onDragEnd?: (player: DraggablePlayer, position: { x: number; y: number }) => void;
  /** Whether dragging is enabled */
  draggable?: boolean;
  /** Custom style for the card */
  style?: ViewStyle;
  /** Card size (width and height) */
  cardSize?: number;
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 0.5,
};

const DraggablePlayerCard: React.FC<DraggablePlayerCardProps> = ({
  player,
  initialPosition,
  containerSize,
  onPress,
  onPositionChange,
  onDragStart,
  onDragEnd,
  draggable = true,
  style,
  cardSize = 35,
}) => {
  // Shared values for position
  const translateX = useSharedValue(initialPosition.x);
  const translateY = useSharedValue(initialPosition.y);
  const scale = useSharedValue(1);
  const zIndex = useSharedValue(1);

  // Track if it's a tap or drag
  const isDragging = useRef(false);
  const startPosition = useRef({ x: 0, y: 0 });

  // Clamp position within bounds
  const clampPosition = useCallback(
    (x: number, y: number) => {
      const halfCard = cardSize / 2;
      const clampedX = Math.max(halfCard, Math.min(containerSize.width - halfCard, x));
      const clampedY = Math.max(halfCard, Math.min(containerSize.height - halfCard, y));
      return { x: clampedX, y: clampedY };
    },
    [containerSize, cardSize]
  );

  // Callbacks (need to wrap for runOnJS)
  const handleDragStart = useCallback(() => {
    onDragStart?.(player);
  }, [onDragStart, player]);

  const handleDragEnd = useCallback(
    (x: number, y: number) => {
      onDragEnd?.(player, { x, y });
      onPositionChange?.(player, { x, y });
    },
    [onDragEnd, onPositionChange, player]
  );

  const handlePress = useCallback(() => {
    onPress?.(player);
  }, [onPress, player]);

  // PanResponder for drag handling
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => draggable,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture if moved more than threshold
        return draggable && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5);
      },
      onPanResponderGrant: () => {
        isDragging.current = false;
        startPosition.current = {
          x: translateX.value,
          y: translateY.value,
        };
        // Animate scale up and bring to front
        scale.value = withSpring(1.2, SPRING_CONFIG);
        zIndex.value = 100;
        handleDragStart();
      },
      onPanResponderMove: (_, gestureState) => {
        isDragging.current = true;
        const newX = startPosition.current.x + gestureState.dx;
        const newY = startPosition.current.y + gestureState.dy;
        const clamped = clampPosition(newX, newY);
        translateX.value = clamped.x;
        translateY.value = clamped.y;
      },
      onPanResponderRelease: (_, gestureState) => {
        // Animate scale back to normal
        scale.value = withSpring(1, SPRING_CONFIG);
        zIndex.value = 1;

        // Check if it was a tap (minimal movement)
        const wasTap = Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10;

        if (wasTap && !isDragging.current) {
          handlePress();
        } else {
          const finalPosition = clampPosition(
            startPosition.current.x + gestureState.dx,
            startPosition.current.y + gestureState.dy
          );
          translateX.value = withSpring(finalPosition.x, SPRING_CONFIG);
          translateY.value = withSpring(finalPosition.y, SPRING_CONFIG);
          handleDragEnd(finalPosition.x, finalPosition.y);
        }
      },
      onPanResponderTerminate: () => {
        // Reset on cancel
        scale.value = withSpring(1, SPRING_CONFIG);
        zIndex.value = 1;
      },
    })
  ).current;

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value - cardSize / 2 },
        { translateY: translateY.value - cardSize / 2 },
        { scale: scale.value },
      ],
      zIndex: zIndex.value,
    };
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.playerCard,
        { width: cardSize, height: cardSize, borderRadius: cardSize / 2 },
        animatedStyle,
        style,
      ]}
    >
      {/* Avatar */}
      {player.avatar ? (
        <Image source={player.avatar} style={[styles.avatar, { width: cardSize, height: cardSize, borderRadius: cardSize / 2 }]} />
      ) : (
        <View style={[styles.avatarPlaceholder, { width: cardSize + 9, height: cardSize + 9, borderRadius: (cardSize + 9) / 2 }]}>
          <ThemedText variant="secondary" size="l" weight="bold">
            {player.name?.charAt(0) || '?'}
          </ThemedText>
        </View>
      )}

      {/* Glow ring effect */}
      <View style={[styles.glowRing, { width: cardSize + 10, height: cardSize + 10, borderRadius: (cardSize + 10) / 2 }]} />

      {/* Player name label */}
      {player.name && (
        <View style={styles.nameLabel}>
          <ThemedText variant="secondary" size="xs" weight="semiBold" numberOfLines={1} style={{ color: '#fff' }}>
            {player.name.split(' ')[0]}
          </ThemedText>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  playerCard: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#00ff66',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  avatar: {
    // Dynamic size set inline
  },
  avatarPlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#00ff66',
    opacity: 0.4,
  },
  nameLabel: {
    position: 'absolute',
    bottom: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 40,
    alignItems: 'center',
  },
});

export default DraggablePlayerCard;

