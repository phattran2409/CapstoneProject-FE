import React from 'react';
import { View, Image, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed';

export type FieldPlayer = {
  id: string;
  name?: string;
  avatar?: any;
} | null;

type lineUp = {
  name : string;
  positions : {x: string, y: string}[];
}

export interface Field3DViewProps {
  players: FieldPlayer[];
  style?: ViewStyle;
  format? : string;
  lineUpName?: string;
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

const lineUp_5vs5 : lineUp[]  = [
  {
    name : "3-1",
    positions : [
      { x: '50%', y: '80%' },  // GK - thủ môn (bottom center)
      { x: '50%', y: '55%' },  // LB - hậu vệ trái
      { x: '70%', y: '45%' },  // RB - hậu vệ phải
      { x: '30%', y: '45%' },  // LW - tiền vệ trái
      { x: '50%', y: '35%' },  // RW - tiền vệ phải
    ],
  },
  {
    name : "2-2",
    positions : [
    { x: '50%', y: '85%' },  // GK - thủ môn (bottom center)
    { x: '15%', y: '65%' },  // LB - hậu vệ trái
    { x: '85%', y: '65%' },  // RB - hậu vệ phải
    { x: '30%', y: '30%' },  // LW - tiền vệ trái
    { x: '70%', y: '30%' },  // RW - tiền vệ phải
  ], 
  },
  {
    name : "2-1-1",
    positions : [
    { x: '50%', y: '85%' },
    { x: '50%', y: '45%' },  // LB - hậu vệ trái
    { x: '50%', y: '65%' },  // RB - hậu vệ phải
    { x: '30%', y: '30%' },  // LW - tiền vệ trái
    { x: '70%', y: '30%' },  // RW - tiền vệ phải  // GK - thủ môn (bottom center)
  ],
  },
  {
    name : "1-3",
    positions : [
    { x: '50%', y: '85%' },
    { x: '50%', y: '65%' },  // LB - hậu vệ trái
    { x: '65%', y: '50%' },  // RB - hậu vệ phải
    { x: '35%', y: '50%' },  // LW - tiền vệ trái
    { x: '50%', y: '30%' },  // RW - tiền vệ phải  // GK - thủ môn (bottom center)
  ],
  },
  {
    name : "1-2-1",
    positions : [
    { x: '50%', y: '85%' },
    { x: '50%', y: '65%' },  // LB - hậu vệ trái
    { x: '65%', y: '50%' },  // RB - hậu vệ phải
    { x: '35%', y: '50%' },  // LW - tiền vệ trái
    { x: '50%', y: '30%' },  // RW - tiền vệ phải  // GK - thủ môn (bottom center)
  ],
  },
  {
    name : "1-1-2",
    positions : [
    { x: '50%', y: '85%' }, 
    { x: '50%', y: '65%' },  // LB - hậu vệ trái
    { x: '50%', y: '45%' },  // RB - hậu vệ phải
    { x: '30%', y: '30%' },  // LW - tiền vệ trái
    { x: '70%', y: '30%' },  // RW - tiền vệ phải  // GK - thủ môn (bottom center)
  ]
  },
]
const lineUp_7vs7 : lineUp[]  = [
  {
    name : "3-3",
    positions : [
      { x: '50%', y: '85%' },  // GK - thủ môn
      { x: '25%', y: '65%' },  // LB - hậu vệ trái
      { x: '50%', y: '65%' },  // CB - trung vệ
      { x: '75%', y: '65%' },  // RB - hậu vệ phải
      { x: '25%', y: '40%' },  // LM - tiền vệ trái
      { x: '50%', y: '40%' },  // CM - tiền vệ giữa
      { x: '75%', y: '40%' },  // RM - tiền vệ phải
    ],
  },
  {
    name : "4-2",
    positions : [
      { x: '50%', y: '85%' },  // GK
      { x: '20%', y: '68%' },  // LB
      { x: '40%', y: '68%' },  // LCB
      { x: '60%', y: '68%' },  // RCB
      { x: '80%', y: '68%' },  // RB
      { x: '35%', y: '40%' },  // LF - tiền đạo trái
      { x: '65%', y: '40%' },  // RF - tiền đạo phải
    ],
  },
  {
    name : "3-2-1",
    positions : [
      { x: '50%', y: '85%' },  // GK
      { x: '25%', y: '68%' },  // LB
      { x: '50%', y: '68%' },  // CB
      { x: '75%', y: '68%' },  // RB
      { x: '35%', y: '50%' },  // LM
      { x: '65%', y: '50%' },  // RM
      { x: '50%', y: '30%' },  // ST - tiền đạo
    ],
  },
  {
    name : "3-1-2",
    positions : [
      { x: '50%', y: '85%' },  // GK
      { x: '25%', y: '68%' },  // LB
      { x: '50%', y: '68%' },  // CB
      { x: '75%', y: '68%' },  // RB
      { x: '50%', y: '52%' },  // CDM - tiền vệ phòng ngự
      { x: '35%', y: '35%' },  // LF
      { x: '65%', y: '35%' },  // RF
    ],
  },
  {
    name : "2-3-1",
    positions : [
      { x: '50%', y: '85%' },  // GK
      { x: '35%', y: '68%' },  // LB
      { x: '65%', y: '68%' },  // RB
      { x: '25%', y: '50%' },  // LM
      { x: '50%', y: '50%' },  // CM
      { x: '75%', y: '50%' },  // RM
      { x: '50%', y: '30%' },  // ST
    ],
  },
  {
    name : "4-1-1",
    positions : [
      { x: '50%', y: '85%' },  // GK
      { x: '20%', y: '68%' },  // LB
      { x: '40%', y: '68%' },  // LCB
      { x: '60%', y: '68%' },  // RCB
      { x: '80%', y: '68%' },  // RB
      { x: '50%', y: '50%' },  // CAM
      { x: '50%', y: '30%' },  // ST
    ],
  },
]

const getFormatPosition = (format: '5vs5' | '7vs7' , index: number, lineUpName : string)  => {
  if (format === '5vs5') {
    const lineup = lineUp_5vs5.find(lineUp => lineUp.name === lineUpName);
    return lineup?.positions[index] || SLOT_POSITIONS[index];
  } else {
    const lineup = lineUp_7vs7.find(lineUp => lineUp.name === lineUpName);
    return lineup?.positions[index] || SLOT_POSITIONS_7VS7[index];
  }
}

// Export function to get available lineups for a format
export const getAvailableLineups = (format: string): string[] => {
  if (format === '5vs5') {
    return lineUp_5vs5.map(lineup => lineup.name);
  } else {
    return lineUp_7vs7.map(lineup => lineup.name);
  }
}

const Field3DView: React.FC<Field3DViewProps> = ({ players, style, onPlayerPress, format = '5vs5', lineUpName = '3-1' }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Background: Ảnh sân bóng */}
      <Image 
        source={require('@assets/images/Gemini_Generated_Image_olny3jolny3jolny.png')}
        style={styles.fieldImage}
        resizeMode="cover"
      />
      
      {/* Overlay: Player Cards */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {players.map((player, index) => {
          const pos = getFormatPosition(format, index, lineUpName);
         
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
