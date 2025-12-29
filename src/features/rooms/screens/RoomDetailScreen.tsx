import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
  } from '@/shared/components/themed';
import { RootStackParamList } from '@/app/navigation/types';
import Field3DView, { FieldPlayer, getAvailableLineups } from '@/shared/components/Field3Dview';
import { ChatInMatches } from '@/shared/components';

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
  const [showChat, setShowChat] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  
  const handleShowChat = () => {
    setShowChat(!showChat);
  };

  // Animate modal when opening/closing
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showChat ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showChat]);
  // Mock data - replace with real data from API
  const roomData = {
    id: roomId,
    format: '7vs7', 
    datetime: '19:00 - 20:30, 28/08',
    venue: {
      name: 'Sân bóng ABC',
      address: '123 Đường XYZ',
    },
    totalPlayers: 10,
    currentPlayers: 9,
    pricePerPlayer: 80000,
    status: 'Sắp diễn ra',
    teams: {
      name: 'Đội A',
      players: [
        { id: '1', name: 'An Nguyễn', avatar: require('@assets/images/icon.png') },
        { id: '2', name: 'Cường Phạm', avatar: require('@assets/images/icon.png') },
        { id: '3', name: 'Emeka Okafor', avatar: require('@assets/images/icon.png') },
        { id: '4', name: 'Giang Hoàng', avatar: require('@assets/images/icon.png') },
      ],
    }
  };

  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam>('teamA');
  const [selectedLineup, setSelectedLineup] = useState<string>('3-1');
  const [isLineupDropdownOpen, setIsLineupDropdownOpen] = useState(false);

  // Get available lineups based on format
  const availableLineups = getAvailableLineups(roomData.format);

  // Update selected lineup when format changes
  useEffect(() => {
    const lineups = getAvailableLineups(roomData.format);
    if (!lineups.includes(selectedLineup)) {
      setSelectedLineup(lineups[0]);
    }
  }, [roomData.format, selectedLineup]);

  const getPlayers = (team: FieldPlayer[]) : FieldPlayer[] => {
    const players : FieldPlayer[] = [];  
    const format = roomData.format === '5vs5' ? 5 : 7;
    for (let i = 0; i < format; i++) {
        players.push(team[i] ? team[i] : null);
    }
    return players;
  }

  const handlePlayerPress = (player: any) => {
    if (player) {
      console.log('Player pressed:', player.name);
      // TODO: Navigate to player profile hoặc show modal
    }
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
          <TouchableOpacity
            onPress={handleShowChat}
            style={{ position: 'relative', width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}
          >
            <ThemedIcon 
              name={showChat ? "close-circle" : "chatbubbles"} 
              size={24} 
              variant={showChat ? "accent" : "secondary"} 
            />
            {!showChat && (
              <View 
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: theme.colors.neonGreen,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: theme.colors.background,
                }}
              >
                <ThemedText 
                  size="xs" 
                  weight="bold" 
                  style={{ color: '#000', fontSize: 10 }}
                >
                  5
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
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
                    {t('roomDetail.datetime')}
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

            {/* Format & Team Info */}
            <ThemedView 
              className="flex-row justify-between items-center rounded-2xl mb-6 px-4 py-4"
              style={{ backgroundColor: theme.colors.surface }}
            >
              {/* Format */}
              <View>
                <ThemedText variant="secondary" size="s" className="mb-2">
                  {t('roomDetail.format')}
                </ThemedText>
                <View className="flex-row items-center">
                  <View 
                    className="px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: theme.colors.neonGreen + '20' }}
                  >
                    <ThemedText 
                      variant="accent" 
                      size="m" 
                      weight="bold"
                      style={{ color: theme.colors.neonGreen }}
                    >
                      {roomData.format}
                    </ThemedText>
                  </View>
                </View>
              </View>
              {/* Team Info */}
              <View>
                <ThemedText variant="secondary" size="s" className="mb-2">
                  Tên Đội
                </ThemedText>
                <View className="flex-row items-center justify-between">
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {roomData.teams.name}
                  </ThemedText>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: theme.colors.neonGreen + '15' }}
                  >
                    <ThemedText 
                      variant="secondary" 
                      size="s"
                      style={{ color: theme.colors.neonGreen }}
                    >
                      {roomData.teams.players.length} / {roomData.format === '5vs5' ? '5' : '7'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedView>

            {/* Lineup Selector Dropdown */}
            <View className="mb-4">
              <ThemedText variant="secondary" size="s" className="mb-2">
                Chọn đội hình:
              </ThemedText>
              <View style={{ position: 'relative', zIndex: 1000 }}>
                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 16,
                    backgroundColor: theme.colors.surface,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  }}
                  onPress={() => setIsLineupDropdownOpen(!isLineupDropdownOpen)}
                >
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {selectedLineup}
                  </ThemedText>
                  <ThemedIcon 
                    name={isLineupDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    variant="secondary" 
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isLineupDropdownOpen && (
                  <View
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      marginTop: 4,
                      borderRadius: 16,
                      backgroundColor: theme.colors.surface,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      overflow: 'hidden',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                    }}
                  >
                    {availableLineups.map((lineup) => (
                      <TouchableOpacity
                        key={lineup}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          backgroundColor: selectedLineup === lineup 
                            ? theme.colors.neonGreen + '20' 
                            : 'transparent',
                          borderBottomWidth: lineup !== availableLineups[availableLineups.length - 1] ? 1 : 0,
                          borderBottomColor: theme.colors.border,
                        }}
                        onPress={() => {
                          setSelectedLineup(lineup);
                          setIsLineupDropdownOpen(false);
                        }}
                      >
                        <ThemedText 
                          variant="primary" 
                          size="m" 
                          weight={selectedLineup === lineup ? "bold" : "medium"}
                          style={{ 
                            color: selectedLineup === lineup 
                              ? theme.colors.neonGreen 
                              : theme.colors.textPrimary 
                          }}
                        >
                          {lineup}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
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
                players={getPlayers(roomData.teams.players) as FieldPlayer[]} 
                style={{ borderRadius: 24 }}
                onPlayerPress={handlePlayerPress}
                format={roomData.format}
                lineUpName={selectedLineup}
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

        {/* Chat Modal */}
        <Modal
          visible={showChat}
          animationType="none"
          transparent={true}
          onRequestClose={() => setShowChat(false)}
        >
          <View className="flex-1 justify-end">
            {/* Backdrop */}
            <TouchableOpacity 
              className="absolute inset-0"
              activeOpacity={1}
              onPress={() => setShowChat(false)}
            >
              <Animated.View 
                className="flex-1"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  opacity: slideAnim,
                }}
              />
            </TouchableOpacity>

            {/* Modal Content */}
            <Animated.View
              className="rounded-t-3xl max-h-[85%]"
              style={{
                backgroundColor: theme.colors.background,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 10,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [600, 0],
                    }),
                  },
                ],
              }}
            >
              {/* Modal Header */}
              <View
                className="border-b pt-2"
                style={{
                  borderBottomColor: theme.colors.border,
                  backgroundColor: theme.colors.background,
                }}
              >
                <View className="flex-row items-center px-5 py-4">
                  <View className="mr-3">
                    <ThemedIcon name="chatbubbles" size={24} variant="accent" />
                  </View>
                  <View className="flex-1">
                    <ThemedText size="l" weight="bold">
                      Chat Đội
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      Trò chuyện với thành viên trong đội
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowChat(false)}
                    className="w-10 h-10 items-center justify-center rounded-full"
                  >
                    <ThemedIcon name="close" size={24} variant="secondary" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Chat Content */}
              <View style={{ height: 600 }}>
                <ChatInMatches 
                  roomId={roomId}
                  maxHeight={600}
                  showHeader={false}
                  onSendMessage={(message: string) => {
                    console.log('Message sent:', message);
                    // TODO: Send message to API
                  }}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
    </ThemedSafeAreaView>
  );
};

export default RoomDetailScreen;

