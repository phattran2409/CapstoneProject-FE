import React from 'react';
import { View, Image, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed';

export type FieldPlayer = {
  id: string;
  name?: string;
  avatar?: any;
} | null;

interface Field3DViewProps {
  players: FieldPlayer[];
  style?: ViewStyle;
  format? : '5vs5' | '7vs7';
  onPlayerPress?: (player: FieldPlayer) => void;
}

// Vị trí các slot trên sân (%, dựa theo ảnh)
const SLOT_POSITIONS = [
  { x: '50%', y: '85%' },  // GK - thủ môn (bottom center)
  { x: '15%', y: '65%' },  // LB - hậu vệ trái
  { x: '85%', y: '65%' },  // RB - hậu vệ phải
  { x: '30%', y: '30%' },  // LW - tiền vệ trái
  { x: '70%', y: '30%' },  // RW - tiền vệ phải
];
const SLOT_POSITIONS_7VS7 = [
  { x: '50%', y: '85%' },  // GK - thủ môn (bottom center)
  { x: '15%', y: '65%' },  // LB - hậu vệ trái
  { x: '85%', y: '65%' },  // RB - hậu vệ phải
  { x: '30%', y: '30%' },  // LW - tiền vệ trái
  { x: '70%', y: '30%' },  // RW - tiền vệ phải
  { x: '30%', y: '50%' },  // CAM
  { x: '70%', y: '50%' },  // CDM 
  
];

const getFormatPosition = (format: '5vs5' | '7vs7') => {
  if (format === '5vs5') {
    return SLOT_POSITIONS;
  } else {
    return SLOT_POSITIONS;
  }
}

const Field3DView: React.FC<Field3DViewProps> = ({ players, style, onPlayerPress }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background: Ảnh sân bóng */}
      <Image 
        source={require('../../assets/Gemini_Generated_Image_olny3jolny3jolny.png')}
        style={styles.fieldImage}
        resizeMode="cover"
      />
      
      {/* Overlay: Player Cards */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {players.map((player, index) => {
          const pos = SLOT_POSITIONS[index] || SLOT_POSITIONS[0];

          if (!player) {
            // Empty slot - dashed circle
            return (
              <View
                key={`empty-${index}`}
                style={[
                  styles.playerCard,
                  styles.emptySlot,
                  {
                    left: pos.x as any,
                    top: pos.y as any,
                  },
                ]}
              >
                <ThemedText variant="secondary" size="xl" weight="bold">+</ThemedText>
              </View>
            );
          }

          // Player card with avatar
          return (
            <TouchableOpacity
              key={player.id}
              style={[
                styles.playerCard,
                {
                  left: pos.x as any,
                  top: pos.y as any,
                },
              ]}
              onPress={() => onPlayerPress?.(player)}
              activeOpacity={0.8}
            >
              {/* Avatar */}
              {player.avatar ? (
                <Image 
                  source={player.avatar} 
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <ThemedText variant="secondary" size="l" weight="bold">
                    {player.name?.charAt(0) || '?'}
                  </ThemedText>
                </View>
              )}
              
              {/* Glow ring effect */}
              <View style={styles.glowRing} />
              
              {/* Optional: Player name label */}
              {player.name && (
                <View style={styles.nameLabel}>
                  <ThemedText 
                    variant="secondary" 
                    size="xs" 
                    weight="semiBold"
                    numberOfLines={1}
                    style={{ color: '#fff' }}
                  >
                    {player.name.split(' ')[0]}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

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
  playerCard: {
    position: 'absolute',
    width: 35,
    height: 35,
    borderRadius: 25,
    backgroundColor: '#00ff66',
    borderWidth: 3,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateX: -25 }, { translateY: -25 }],
    shadowColor: '#00ff66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 12,
    elevation: 10,
  },
  emptySlot: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderWidth: 2,
    shadowOpacity: 0,
  },
  avatar: {
    width: 35,
    height: 35,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowRing: {
    position: 'absolute',
    width: 45,
    height: 45,
    borderRadius: 30,
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

export default Field3DView;
