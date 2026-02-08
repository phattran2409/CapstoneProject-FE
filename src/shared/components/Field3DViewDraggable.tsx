import React, { useState, useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { View, Image, StyleSheet, ViewStyle, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import { ThemedText } from './themed';
import DraggablePlayerCard, { DraggablePlayer } from './DraggablePlayerCard';

export type FieldPlayer = {
  id: string;
  name?: string;
  avatar?: any;
} | null;

type lineUp = {
  name: string;
  positions: { x: string; y: string }[];
};

/** Position data for a single player */
export type PlayerPosition = {
  playerId: string;
  playerName?: string;
  index: number;
  /** Position in pixels */
  position: { x: number; y: number };
  /** Position in percentage (0-100) */
  positionPercent: { x: number; y: number };
};

/** All positions data to send to server */
export type AllPlayerPositions = PlayerPosition[];

/** Methods exposed via ref */
export interface Field3DViewDraggableRef {
  /** Get all current player positions */
  getAllPositions: () => AllPlayerPositions;
  /** Get container size */
  getContainerSize: () => { width: number; height: number };
}

export interface Field3DViewDraggableProps {
  players: FieldPlayer[];
  style?: ViewStyle;
  format?: string;
  lineUpName?: string;
  /** Called when empty slot is pressed */
  onEmptySlotPress?: (index: number) => void;
  /** Called when player is pressed (tapped, not dragged) */
  onPlayerPress?: (player: FieldPlayer) => void;
  /** Called when player position changes after drag */
  onPlayerPositionChange?: (player: FieldPlayer, position: { x: number; y: number }, index: number) => void;
  /** Called with ALL player positions whenever any position changes */
  onPositionsChange?: (positions: AllPlayerPositions) => void;
  /** Whether players can be dragged */
  draggable?: boolean;
}

// Slot positions remain the same as original
const SLOT_POSITIONS = [
  { x: '50%', y: '85%' },
  { x: '15%', y: '65%' },
  { x: '85%', y: '65%' },
  { x: '30%', y: '30%' },
  { x: '70%', y: '30%' },
];

const SLOT_POSITIONS_7VS7 = [
  { x: '50%', y: '85%' },
  { x: '15%', y: '65%' },
  { x: '85%', y: '65%' },
  { x: '30%', y: '30%' },
  { x: '70%', y: '30%' },
  { x: '30%', y: '50%' },
  { x: '70%', y: '50%' },
];

const lineUp_5vs5: lineUp[] = [
  {
    name: '3-1',
    positions: [
      { x: '50%', y: '80%' },
      { x: '50%', y: '55%' },
      { x: '70%', y: '45%' },
      { x: '30%', y: '45%' },
      { x: '50%', y: '35%' },
    ],
  },
  {
    name: '2-2',
    positions: [
      { x: '50%', y: '85%' },
      { x: '15%', y: '65%' },
      { x: '85%', y: '65%' },
      { x: '30%', y: '30%' },
      { x: '70%', y: '30%' },
    ],
  },
  {
    name: '2-1-1',
    positions: [
      { x: '50%', y: '85%' },
      { x: '50%', y: '45%' },
      { x: '50%', y: '65%' },
      { x: '30%', y: '30%' },
      { x: '70%', y: '30%' },
    ],
  },
  {
    name: '1-3',
    positions: [
      { x: '50%', y: '85%' },
      { x: '50%', y: '65%' },
      { x: '65%', y: '50%' },
      { x: '35%', y: '50%' },
      { x: '50%', y: '30%' },
    ],
  },
  {
    name: '1-2-1',
    positions: [
      { x: '50%', y: '85%' },
      { x: '50%', y: '65%' },
      { x: '65%', y: '50%' },
      { x: '35%', y: '50%' },
      { x: '50%', y: '30%' },
    ],
  },
  {
    name: '1-1-2',
    positions: [
      { x: '50%', y: '85%' },
      { x: '50%', y: '65%' },
      { x: '50%', y: '45%' },
      { x: '30%', y: '30%' },
      { x: '70%', y: '30%' },
    ],
  },
];

const lineUp_7vs7: lineUp[] = [
  {
    name: '3-3',
    positions: [
      { x: '50%', y: '85%' },
      { x: '25%', y: '65%' },
      { x: '50%', y: '65%' },
      { x: '75%', y: '65%' },
      { x: '25%', y: '40%' },
      { x: '50%', y: '40%' },
      { x: '75%', y: '40%' },
    ],
  },
  {
    name: '4-2',
    positions: [
      { x: '50%', y: '85%' },
      { x: '20%', y: '68%' },
      { x: '40%', y: '68%' },
      { x: '60%', y: '68%' },
      { x: '80%', y: '68%' },
      { x: '35%', y: '40%' },
      { x: '65%', y: '40%' },
    ],
  },
  {
    name: '3-2-1',
    positions: [
      { x: '50%', y: '85%' },
      { x: '25%', y: '68%' },
      { x: '50%', y: '68%' },
      { x: '75%', y: '68%' },
      { x: '35%', y: '50%' },
      { x: '65%', y: '50%' },
      { x: '50%', y: '30%' },
    ],
  },
  {
    name: '3-1-2',
    positions: [
      { x: '50%', y: '85%' },
      { x: '25%', y: '68%' },
      { x: '50%', y: '68%' },
      { x: '75%', y: '68%' },
      { x: '50%', y: '52%' },
      { x: '35%', y: '35%' },
      { x: '65%', y: '35%' },
    ],
  },
  {
    name: '2-3-1',
    positions: [
      { x: '50%', y: '85%' },
      { x: '35%', y: '68%' },
      { x: '65%', y: '68%' },
      { x: '25%', y: '50%' },
      { x: '50%', y: '50%' },
      { x: '75%', y: '50%' },
      { x: '50%', y: '30%' },
    ],
  },
  {
    name: '4-1-1',
    positions: [
      { x: '50%', y: '85%' },
      { x: '20%', y: '68%' },
      { x: '40%', y: '68%' },
      { x: '60%', y: '68%' },
      { x: '80%', y: '68%' },
      { x: '50%', y: '50%' },
      { x: '50%', y: '30%' },
    ],
  },
];

const getFormatPosition = (format: '5vs5' | '7vs7', index: number, lineUpName: string) => {
  if (format === '5vs5') {
    const lineup = lineUp_5vs5.find((l) => l.name === lineUpName);
    return lineup?.positions[index] || SLOT_POSITIONS[index];
  } else {
    const lineup = lineUp_7vs7.find((l) => l.name === lineUpName);
    return lineup?.positions[index] || SLOT_POSITIONS_7VS7[index];
  }
};

// Convert percentage string to pixel value
const percentToPixel = (percent: string, total: number): number => {
  const value = parseFloat(percent);
  return (value / 100) * total;
};

export const getAvailableLineups = (format: string): string[] => {
  if (format === '5vs5') {
    return lineUp_5vs5.map((lineup) => lineup.name);
  } else {
    return lineUp_7vs7.map((lineup) => lineup.name);
  }
};

const Field3DViewDraggable = forwardRef<Field3DViewDraggableRef, Field3DViewDraggableProps>(
  (
    {
      players,
      style,
      onPlayerPress,
      onEmptySlotPress,
      onPlayerPositionChange,
      onPositionsChange,
      format = '5vs5',
      lineUpName = '3-1',
      draggable = true,
    },
    ref
  ) => {
    // Container size state
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

    // Track player positions (for custom positions after drag)
    const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

    // Convert pixel to percentage
    const pixelToPercent = useCallback(
      (pixel: number, total: number): number => {
        if (total === 0) return 0;
        return (pixel / total) * 100;
      },
      []
    );

    // Get position for a player (custom or default)
    const getPlayerPosition = useCallback(
      (player: FieldPlayer, index: number): { x: number; y: number } => {
        if (!player) return { x: 0, y: 0 };

        // Check if there's a custom position
        if (customPositions[player.id]) {
          return customPositions[player.id];
        }

        // Calculate from percentage
        const pos = getFormatPosition(format as '5vs5' | '7vs7', index, lineUpName);
        return {
          x: percentToPixel(pos.x, containerSize.width),
          y: percentToPixel(pos.y, containerSize.height),
        };
      },
      [containerSize, format, lineUpName, customPositions]
    );

    // Get ALL player positions
    const getAllPositions = useCallback((): AllPlayerPositions => {
      const positions: AllPlayerPositions = [];
      
      players.forEach((player, index) => {
        if (!player) return;

        const position = getPlayerPosition(player, index);
        positions.push({
          playerId: player.id,
          playerName: player.name,
          index,
          position,
          positionPercent: {
            x: pixelToPercent(position.x, containerSize.width),
            y: pixelToPercent(position.y, containerSize.height),
          },
        });
      });
      
      return positions;
    }, [players, getPlayerPosition, containerSize, pixelToPercent]);

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getAllPositions,
        getContainerSize: () => containerSize,
      }),
      [getAllPositions, containerSize]
    );

    // Handle layout measurement
    const handleLayout = useCallback((event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout;
      setContainerSize({ width, height });
    }, []);

    // Handle position change
    const handlePositionChange = useCallback(
      (player: DraggablePlayer, position: { x: number; y: number }, index: number) => {
        setCustomPositions((prev) => {
          const newPositions = {
            ...prev,
            [player.id]: position,
          };
          return newPositions;
        });
        onPlayerPositionChange?.(player, position, index);
      },
      [onPlayerPositionChange]
    );

    // Notify parent of all positions when customPositions changes
    useEffect(() => {
      if (containerSize.width > 0 && containerSize.height > 0) {
        onPositionsChange?.(getAllPositions());
      }
    }, [customPositions, containerSize, getAllPositions, onPositionsChange]);

    // Get initial position for a player (alias for getPlayerPosition)
    const getInitialPosition = getPlayerPosition;

  return (
    <View style={[styles.container, style]} onLayout={handleLayout}>
      {/* Background: Field Image */}
      <Image
        source={require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png')}
        style={styles.fieldImage}
        resizeMode="cover"
      />

      {/* Overlay: Player Cards */}
      {containerSize.width > 0 && containerSize.height > 0 && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          {players.map((player, index) => {
            const pos = getFormatPosition(format as '5vs5' | '7vs7', index, lineUpName);

            if (!player) {
              // Empty slot - dashed circle
              return (
                <TouchableOpacity
                  key={`empty-${index}`}
                  style={[
                    styles.emptySlot,
                    {
                      left: pos.x as any,
                      top: pos.y as any,
                    },
                  ]}
                  onPress={() => onEmptySlotPress?.(index)}
                >
                  <ThemedText variant="secondary" size="xl" weight="bold">
                    +
                  </ThemedText>
                </TouchableOpacity>
              );
            }

            // Draggable player card
            const initialPos = getInitialPosition(player, index);

            return (
              <DraggablePlayerCard
                key={player.id}
                player={player}
                initialPosition={initialPos}
                containerSize={containerSize}
                onPress={() => onPlayerPress?.(player)}
                onPositionChange={(p, position) => { console.log('position change', p, position); handlePositionChange(p, position, index)}}
                draggable={draggable}
                cardSize={35}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

Field3DViewDraggable.displayName = 'Field3DViewDraggable';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 260,
    position: 'relative',
    overflow: 'hidden',
  },
  fieldImage: {
    width: '100%',
    height: '100%',
  },
  emptySlot: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
});

export default Field3DViewDraggable;

