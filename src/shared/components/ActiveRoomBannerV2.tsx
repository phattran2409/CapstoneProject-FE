import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useActiveRoomStore } from '@/features/rooms/store/activeRoomStore';
import { useRoomDetail } from '@/features/rooms';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

/**
 * Giải pháp 1: In-app Banner - Chỉ hiển thị ở đầu màn hình Matches
 * Ưu điểm:
 * - Không gây phiền nhiễu như floating button
 * - Dễ nhìn thấy khi user vào tab Matches
 * - Logic đơn giản, dễ maintain
 * - Performance tốt hơn (không có animation phức tạp)
 */
export const ActiveRoomBannerV2: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const { roomId, clearActiveRoom } = useActiveRoomStore();
  const { user } = useAuthStore();

  // Fetch room data if roomId exists
  const { data: room } = useRoomDetail(roomId || '', {
    enabled: !!roomId && !!user,
  });

  const isAuthenticated = !!user;
  const isActive = roomId && room && room.status !== 'completed' && room.status !== 'cancelled';

  // Chỉ hiển thị nếu có active room
  if (!isAuthenticated || !isActive) {
    return null;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleNavigateToRoom = () => {
    if (roomId) {
      navigation.navigate('RoomInformation', { roomId });
    }
  };

  const handleDismiss = () => {
    clearActiveRoom();
  };

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.neonGreen + '15', borderColor: theme.colors.neonGreen + '30' }]}>
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.neonGreen + '20' }]}>
            <Ionicons name="football" size={20} color={theme.colors.neonGreen} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={[styles.bannerTitle, { color: theme.colors.text }]}>
              Phòng của bạn đang hoạt động
            </Text>
            <Text style={[styles.bannerSubtitle, { color: theme.colors.textSecondary }]}>
              {room?.currentPlayers}/{room?.totalPlayers} người • {formatDate(room?.datetime || '')}
            </Text>
          </View>
        </View>
        <View style={styles.bannerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.colors.neonGreen }]}
            onPress={handleNavigateToRoom}
          >
            <Text style={[styles.actionButtonText, { color: theme.colors.darkBlack }]}>
              Xem
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dismissButton}
            onPress={handleDismiss}
          >
            <Ionicons name="close" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 12,
  },
  bannerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  dismissButton: {
    padding: 4,
  },
});

