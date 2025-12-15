import React, { useState } from 'react';
import { View, TouchableOpacity, Image, TextInput } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
} from '../components/themed';
import { RootStackParamList } from '../navigation/types';
import Field3DView, { FieldPlayer } from '../components/Field3Dview';

type RoomDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;

interface RoomDetailScreenProps {
  navigation?: RoomDetailScreenNavigationProp;
  route?: {
    params: {
      roomId: string;
    };
  };
}

interface Player {
  id: string;
  name: string;
  avatar: any;
}

interface Team {
  name: string;
  players: (Player | null)[];
}

type SelectedTeam = 'teamA' | 'teamB';

const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId } = route?.params || { roomId: '1' };

  // Mock data - replace with real data from API
  const roomData = {
    id: roomId,
    format: '5 vs 5',
    datetime: '19:00 - 20:30, 28/08',
    venue: {
      name: 'Sân bóng ABC',
    },
    totalPlayers: 10,
    currentPlayers: 9,
    pricePerPlayer: 80000,
  };

  const [teams] = useState<{ teamA: Team; teamB: Team }>({
    teamA: {
      name: 'Đội A',
      players: [
        { id: '1', name: 'An Nguyễn', avatar: require('../../assets/icon.png') },
        { id: '2', name: 'Cường Phạm', avatar: require('../../assets/icon.png') },
        { id: '3', name: 'Emeka Okafor', avatar: require('../../assets/icon.png') },
        { id: '4', name: 'Giang Hoàng', avatar: require('../../assets/icon.png') },
        null, // Empty slot
      ],
    },
    teamB: {
      name: 'Đội B',
      players: [
        { id: '5', name: 'Bình Lê', avatar: require('../../assets/icon.png') },
        { id: '6', name: 'Dung Trần', avatar: require('../../assets/icon.png') },
        { id: '7', name: 'Fiona Do', avatar: require('../../assets/icon.png') },
        { id: '8', name: 'Hạnh Mai', avatar: require('../../assets/icon.png') },
        { id: '9', name: 'Tuấn Minh', avatar: require('../../assets/icon.png') },
      ],
    },
  });

  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam>('teamA');

  const currentTeam = teams[selectedTeam];

  const handlePlayerPress = (player: any) => {
    if (player) {
      console.log('Player pressed:', player.name);
      // TODO: Navigate to player profile hoặc show modal
    }
  };

  const renderPlayerOnField = (player: Player | null, index: number) => {
    // 5 giả lập vị trí: GK, LB, RB, LW, RW
    const positions = [
      { top: 0.72, left: 0.5 },  // GK
      { top: 0.5, left: 0.18 },  // LB
      { top: 0.5, left: 0.82 },  // RB
      { top: 0.28, left: 0.3 },  // LW
      { top: 0.28, left: 0.7 },  // RW
    ];

    const pos = positions[index] || positions[0];

    if (!player) {
      return (
        <View
          key={`empty-${index}`}
          style={{
            position: 'absolute',
            top: `${pos.top * 100}%`,
            left: `${pos.left * 100}%`,
            transform: [{ translateX: -24 }, { translateY: -24 }],
            width: 48,
            height: 48,
            borderRadius: 999,
            borderWidth: 2,
            borderStyle: 'dashed',
            borderColor: theme.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedIcon name="add" size={20} variant="secondary" />
        </View>
      );
    }

    return (
      <View
        key={player.id}
        style={{
          position: 'absolute',
          top: `${pos.top * 100}%`,
          left: `${pos.left * 100}%`,
          transform: [{ translateX: -24 }, { translateY: -24 }],
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: 999,
            borderWidth: 3,
            borderColor: theme.colors.neonGreen,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          <Image
            source={player.avatar}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  };

  return (
    <ThemedSafeAreaView className="py-10">
      {/* Header */}
      <ThemedView 
        className="flex-row items-center justify-between px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t('roomDetail.title')}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Match Info */}
          <View className="mb-6">
            <ThemedView 
              className="flex-row justify-between px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View>
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.datetime')}
                </ThemedText>
                <ThemedText variant="primary" size="m" weight="semiBold">
                  {roomData.datetime}
                </ThemedText>
              </View>
              <View>
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.venue')}
                </ThemedText>
                <ThemedText variant="primary" size="m" weight="medium">
                  {roomData.venue.name}
                </ThemedText>
              </View>
            </ThemedView>

            <ThemedView 
              className="flex-row justify-between px-4 py-4 rounded-2xl"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View>
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.format')}
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {roomData.datetime}
                </ThemedText>
              </View>
              <View>
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.status')}
                </ThemedText>
                <ThemedText 
                  variant="accent" 
                  size="m" 
                  weight="bold"
                  style={{ color: theme.colors.neonGreen }}
                >
                  Sắp diễn ra
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* Team Switch Tabs */}
          <View 
            className="flex-row rounded-2xl mb-6"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: selectedTeam === 'teamA' ? theme.colors.neonGreen : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setSelectedTeam('teamA')}
            >
              <ThemedText
                size="m"
                weight="bold"
                style={{ color: selectedTeam === 'teamA' ? '#000' : theme.colors.textSecondary }}
              >
                Đội A ({teams.teamA.players.filter(Boolean).length}/5)
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 16,
                backgroundColor: selectedTeam === 'teamB' ? theme.colors.neonGreen : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setSelectedTeam('teamB')}
            >
              <ThemedText
                size="m"
                weight="bold"
                style={{ color: selectedTeam === 'teamB' ? theme.colors.darkBlack : theme.colors.textSecondary }}
              >
                Đội B ({teams.teamB.players.filter(Boolean).length}/5)
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Field Layout - 3D View */}
          <View 
            style={{
              borderRadius: 24,
              borderWidth: 1,
              borderColor: theme.colors.border,
              overflow: 'hidden',
              backgroundColor: '#111',
              padding: 16,
            }}
          >
            <Field3DView 
              players={currentTeam.players as FieldPlayer[]} 
              style={{ borderRadius: 24 }}
              onPlayerPress={handlePlayerPress}
              format="7vs7"
            />
          </View>

          {/* Check-in & Payment */}
          <View className="mt-6 mb-4">
            <ThemedView
              className="px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <ThemedText variant="primary" size="l" weight="bold" className="mb-2">
                Check-in & Thanh toán
              </ThemedText>
              <View className="flex-row items-center justify-between">
                <ThemedText variant="secondary" size="s">
                  Tiền sân mỗi người:
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="bold">
                  {roomData.pricePerPlayer.toLocaleString('vi-VN')}đ
                </ThemedText>
              </View>

              <View className="flex-row mt-4 gap-3">
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.neonGreen,
                  }}
                >
                  <ThemedIcon name="qr-code" size={20} variant="accent" />
                  <ThemedText
                    size="m"
                    weight="bold"
                    className="ml-2"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    Check-in Ngay
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: theme.colors.neonGreen,
                  }}
                >
                  <ThemedIcon name="card" size={20} color="#000" />
                  <ThemedText
                    size="m"
                    weight="bold"
                    className="ml-2"
                    style={{ color: '#000' }}
                  >
                    Thanh toán
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </ThemedView>
          </View>
        </View>
      </ThemedScrollView>

      {/* Chat input */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 20,
          paddingTop: 8,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            borderRadius: 999,
            backgroundColor: theme.colors.surface,
            paddingHorizontal: 16,
            paddingVertical: 10,
          }}
        >
          <TextInput
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={theme.colors.textSecondary}
            style={{ color: theme.colors.textPrimary }}
          />
        </View>
        <TouchableOpacity
          style={{
            width: 52,
            height: 52,
            borderRadius: 18,
            backgroundColor: theme.colors.neonGreen,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ThemedIcon name="send" size={22} color="#000" />
        </TouchableOpacity>
      </View>
    </ThemedSafeAreaView>
  );
};

export default RoomDetailScreen;

