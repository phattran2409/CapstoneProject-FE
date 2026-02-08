import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/theme';
import { useActiveRoomStore } from '@/features/rooms/store/activeRoomStore';
import { useRoomDetail } from '@/features/rooms';
import { useAuthStore } from '@/features/auth/store/authStore';

/**
 * Tab Badge Component - Hiển thị badge trên tab khi có active room
 * Sử dụng trong CustomTabBar để hiển thị indicator
 */
export const TabBadge: React.FC = () => {
  const { theme } = useTheme();
  const { roomId } = useActiveRoomStore();
  const { user } = useAuthStore();
  
  const { data: room } = useRoomDetail(roomId || '', {
    enabled: !!roomId && !!user,
  });

  const isActive = roomId && room && room.status !== 'completed' && room.status !== 'cancelled';

  if (!isActive) {
    return null;
  }

  return (
    <View style={[styles.badge, { backgroundColor: theme.colors.neonGreen }]}>
      {room && room.currentPlayers > 0 && (
        <Text style={styles.badgeText}>{room.currentPlayers}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: '#000',
    fontSize: 9,
    fontWeight: '700',
  },
});

