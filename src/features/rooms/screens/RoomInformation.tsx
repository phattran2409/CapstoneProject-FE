import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Alert, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
  ThemedCard 
} from '@/shared/components/themed';
import { RootStackParamList } from '@/app/navigation/types';
import { 
  useMatchRoomDetail,
  useUpdateParticipant,
  useLeaveMatchRoom,
  useKickPlayer, 
  useCancelRoom, 
  type MatchRoomFullInfo,
  type MatchRoomParticipant,
  type TeamAssignment,
} from '@/features/rooms';
import { useAuthStore } from '@/features/auth';
import SplashScreen from '@/features/splash/screens/SplashScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { 
  HostMenuModal, 
  ParticipantCard, 
  EmptySlotCard, 
  PositionSelectionModal,
  type PlayerPosition,
} from '../components';
import { useMatchRoomSignalR, useMatchRoomSignalRHandlers } from '@/shared/hooks';
import { useToast } from '@/shared/toast';

type RoomInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

interface RoomInformationScreenProps {
  navigation?: RoomInformationScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'RoomInformation'>;
}

// ==================== Main Screen Component ====================
const RoomInformationScreen: React.FC<RoomInformationScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId } = route?.params;
  const nav = useNavigation<RoomInformationScreenNavigationProp>();
  
  // ✅ Handle back navigation (supports deep link)
  const handleGoBack = () => {
    // Check if there's a previous screen in the stack
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      // No stack (came from deep link), navigate to MainTabs
      nav.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };
  
  // ✅ Use React Query hooks - sử dụng useMatchRoomDetail cho MatchRoomFullInfo
  const { data: room, isLoading, error, refetch } = useMatchRoomDetail(roomId);
  const { mutate: updateParticipant, isPending: isUpdatingParticipant } = useUpdateParticipant();
  const { mutate: leaveMatchRoom, isPending: isLeaving } = useLeaveMatchRoom();
  const { mutate: kickPlayer, isPending: isKicking } = useKickPlayer();
  const { mutate: cancelRoom, isPending: isCancelling } = useCancelRoom();

  const { user } = useAuthStore();
  
  // ✅ Local room data state for real-time updates
  const [roomData, setRoomData] = useState<MatchRoomFullInfo | null>(null);
  
  // ✅ Sync room data from React Query
  useEffect(() => {
    if (room) {
      setRoomData(room);
    }
  }, [room]);
  
  // ✅ Use roomData for display (có real-time updates) hoặc fallback về room từ query
  const displayRoom = roomData || room;
  
  console.log('room', displayRoom);
  
  // ✅ Check if user is the host
  const isHost = displayRoom?.hostId === user?.userId;

  // ✅ Check if current user is already in the room
  const currentUserParticipant = useMemo(() => {
    if (!displayRoom || !user?.userId) return null;
    const allParticipants = [
      ...displayRoom.participants.teamA,
      ...displayRoom.participants.teamB,
      ...displayRoom.participants.unassigned,
    ];
    return allParticipants.find(p => p.userId === user.userId) || null;
  }, [displayRoom, user?.userId]);

  // ✅ Selected team (A, B, or null)
  const [selectedTeam, setSelectedTeam] = useState<TeamAssignment | null>(null);
  
  // ✅ Local UI state
  const [activeTab, setActiveTab] = useState<'teams' | 'host' | 'venue'>('teams');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);
  
  // ✅ Position selection modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingTeamAssignment, setPendingTeamAssignment] = useState<'A' | 'B' | null>(null);

  // ==================== SignalR Integration ====================
  
  // ✅ Toast hook for notifications
  const toast = useToast();
  
  /**
   * Callback hiển thị notification - sử dụng Toast thay vì Alert
   */
  const showNotification = useCallback((message: string, type?: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        toast.success('Thành công', message);
        break;
      case 'error':
        toast.error('Lỗi', message);
        break;
      case 'warning':
        toast.warning('Cảnh báo', message);
        break;
      case 'info':
      default:
        toast.info('Thông báo', message);
        break;
    }
  }, [toast]);

  /**
   * Callback khi bị kick - điều hướng về trang trước
   */
  const handleKickedFromRoom = useCallback((payload: any) => {
    if (payload.kickedUserId === user?.userId) {
      Alert.alert(
        'Bạn đã bị kick',
        payload.reason || 'Bạn đã bị kick khỏi phòng bởi host',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.canGoBack()) {
                navigation.goBack();
              } else {
                nav.reset({
                  index: 0,
                  routes: [{ name: 'MainTabs' }],
                });
              }
            },
          },
        ]
      );
    }
  }, [user?.userId, navigation, nav]);

  /**
   * Callback khi room bị xóa - điều hướng về trang trước
   */
  const handleRoomDeleted = useCallback(() => {
    Alert.alert(
      'Phòng đã bị xóa',
      'Phòng đã bị xóa bởi host hoặc đã hết người chơi.',
      [
        {
          text: 'OK',
          onPress: () => {
            if (navigation?.canGoBack()) {
              navigation.goBack();
            } else {
              nav.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            }
          },
        },
      ]
    );
  }, [navigation, nav]);

  /**
   * Callback khi host thay đổi
   */
  const handleHostChanged = useCallback((newHostId: string) => {
    // Refetch để lấy thông tin host mới đầy đủ
    refetch();
    
    // Nếu user hiện tại trở thành host
    if (newHostId === user?.userId) {
      Alert.alert(
        'Bạn đã trở thành Host!',
        'Host cũ đã rời khỏi phòng. Bạn được chỉ định làm host mới.',
        [{ text: 'OK' }]
      );
    }
  }, [user?.userId, refetch]);

  // ✅ Tạo SignalR handlers
  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: user?.userId,
    setRoomData,
    showNotification,
    onKicked: handleKickedFromRoom,
    onRoomDeleted: handleRoomDeleted,
    onHostChanged: handleHostChanged,
  });

  // ✅ Kết nối SignalR với handlers
  const { isConnected: isSignalRConnected, connectionState } = useMatchRoomSignalR(signalRHandlers);
  
  // Log connection state for debugging
  useEffect(() => {
    console.log('🔌 SignalR Connection State:', connectionState, 'Connected:', isSignalRConnected);
  }, [connectionState, isSignalRConnected]);

  // ✅ Handle open position selection modal
  const handleOpenPositionModal = (teamAssignment: TeamAssignment) => {
    if (!user) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tham gia phòng');
      return;
    }

    // User phải là participant (đã join vào Unassigned từ MatchesScreen)
    if (!currentUserParticipant) {
      Alert.alert('Chưa tham gia', 'Bạn cần tham gia phòng trước khi chọn đội');
      return;
    }

    // Nếu đã có team rồi thì thông báo (có thể cho phép đổi team sau này)
    // if (currentUserParticipant.teamAssignment !== 'Unassigned') {
    //   Alert.alert('Đã chọn đội', `Bạn đã ở Team ${currentUserParticipant.teamAssignment}`);
    //   return;
    // }

    // Set pending team and show modal
    if (teamAssignment === 'A' || teamAssignment === 'B') {
      setPendingTeamAssignment(teamAssignment);
      setShowPositionModal(true);
    }
  };

  // ✅ Handle position selected from modal - Cập nhật team assignment và position
  const handlePositionSelected = (position: PlayerPosition) => {
    if (!pendingTeamAssignment || !displayRoom) return;

    // Gọi PUT /participants/me để cập nhật team và position
    // Server sẽ broadcast ParticipantUpdated event qua SignalR
    updateParticipant(
      { 
        roomId: displayRoom.roomId, 
        teamAssignment: pendingTeamAssignment, 
        position: position,
      },
      {
        onSuccess: () => {
          toast.success(
            'Chọn đội thành công!', 
            `Bạn đã chọn Team ${pendingTeamAssignment} với vị trí ${position}`
          );
          setSelectedTeam(pendingTeamAssignment);
          setShowPositionModal(false);
          setPendingTeamAssignment(null);
          // SignalR sẽ tự động cập nhật UI, nhưng refetch để đảm bảo
          refetch();
        },
        onError: (error: any) => {
          toast.error('Lỗi', error.message || 'Không thể chọn đội');
          setShowPositionModal(false);
          setPendingTeamAssignment(null);
        },
      }
    );
  };

  // ✅ Handle close position modal
  const handleClosePositionModal = () => {
    setShowPositionModal(false);
    setPendingTeamAssignment(null);
  };

  const handleJoinMatch = () => {
    if (!currentUserParticipant) {
      Alert.alert('Please join a team', 'You need to join a team before entering the match');
      return;
    }
    navigation?.navigate('RoomDetail', { roomId });
  };

  // ✅ Handle kick player (host only)
  const handleKickPlayer = (userId: string, playerName: string) => {
    Alert.alert(
      'Kick Player',
      `Are you sure you want to kick ${playerName} from the room?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Kick',
          style: 'destructive',
          onPress: () => {
            kickPlayer(
              { roomId, playerId: userId },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Player has been kicked from the room');
                  refetch();
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Failed to kick player');
                },
              }
            );
          },
        },
      ]
    );
  };

  // ✅ Handle cancel room (host only)
  const handleCancelRoom = () => {
    Alert.alert(
      'Cancel Room',
      'Are you sure you want to cancel this room? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelRoom(roomId, {
              onSuccess: () => {
                Alert.alert('Success', 'Room has been cancelled');
                navigation?.goBack();
              },
              onError: (error: any) => {
                Alert.alert('Error', error.message || 'Failed to cancel room');
              },
            });
          },
        },
      ]
    );
  };

  // ✅ Handle leave room
  const handleLeaveRoom = () => {
    Alert.alert(
      t('roomDetail.leaveRoomTitle', 'Rời phòng'),
      t('roomDetail.leaveRoomMessage', 'Bạn có chắc muốn rời khỏi phòng này?'),
      [
        { text: t('common.cancel', 'Hủy'), style: 'cancel' },
        {
          text: t('roomDetail.leaveRoomConfirm', 'Rời phòng'),
          style: 'destructive',
          onPress: () => {
            leaveMatchRoom(roomId, {
              onSuccess: () => {
                toast.success(t('roomDetail.leaveRoomSuccess', 'Rời phòng'), t('roomDetail.leaveRoomSuccessDesc', 'Bạn đã rời khỏi phòng'));
                handleGoBack();
              },
              onError: (error: any) => {
                toast.error(t('common.error', 'Lỗi'), error.message || t('roomDetail.leaveRoomError', 'Không thể rời phòng'));
              },
            });
          },
        },
      ]
    );
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <SplashScreen />
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <ThemedSafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText variant="secondary" style={[styles.errorText, { color: '#ef4444' }]}>
            {(error as any).message}
          </ThemedText>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: theme.colors.neonGreen }]}
          >
            <ThemedText weight="bold" style={{ color: '#000' }}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedSafeAreaView>
    );
  }

  // ✅ Not found state
  if (!displayRoom) {
    return (
      <ThemedSafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.notFoundContainer}>
          <ThemedText>Room not found</ThemedText>
        </ThemedView>
      </ThemedSafeAreaView>
    );
  }


  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      {/* Header */}
      <ThemedView 
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border }
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t('roomDetail.title')}
          </ThemedText>
        </View>
        
        <View style={styles.headerRight}>
          {/* Leave Room Button (when user is participant) */}
          {currentUserParticipant && (
            <TouchableOpacity
              onPress={handleLeaveRoom}
              disabled={isLeaving}
              style={styles.menuButton}
            >
              <Ionicons
                name="exit-outline"
                size={24}
                color={theme.colors.error || '#ef4444'}
              />
            </TouchableOpacity>
          )}
          {/* Menu Button (Host only) */}
          {isHost && (
            <TouchableOpacity
              onPress={() => setShowMenuModal(true)}
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </ThemedView>

      {/* Tab Navigation */}
      <View 
        style={[
          styles.tabContainer,
          { borderBottomColor: theme.colors.border }
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('teams')}
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'teams' ? theme.colors.neonGreen + '20' : 'transparent',
              marginRight: 8,
            }
          ]}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'teams' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'teams' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Teams
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('host')}
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'host' ? theme.colors.neonGreen + '20' : 'transparent',
              marginRight: 8,
            }
          ]}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'host' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'host' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Host Info
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('venue')}
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'venue' ? theme.colors.neonGreen + '20' : 'transparent',
            }
          ]}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'venue' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'venue' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Venue
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          {/* Teams Tab Content */}
          {activeTab === 'teams' && (
            <>
          {/* Room Info Section */}
          <View style={styles.roomInfoSection}>
            {/* Format */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="people" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  {t('roomDetail.format')}
                </ThemedText>
                <ThemedText variant="primary" size="xl" weight="bold">
                  {displayRoom.matchFormat === 'FiveVsFive' ? '5v5' : displayRoom.matchFormat === 'SevenVsSeven' ? '7v7' : displayRoom.matchFormat}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Datetime */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="time" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  {t('roomDetail.datetime')}
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {new Date(displayRoom.matchDate).toLocaleDateString('vi-VN')} • {displayRoom.startTime} - {displayRoom.endTime}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Venue */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="location" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  {t('roomDetail.venue')}
                </ThemedText>
                <ThemedText variant="primary" size="m" weight="medium">
                  {displayRoom.field.fieldName} - {displayRoom.field.venue.venueName}
                </ThemedText>
                <ThemedText variant="secondary" size="s">
                  {displayRoom.field.venue.address}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Deposit */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="cash" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  Deposit / Person
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRoom.depositPerPerson)}
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* Team Lineup Section */}
          <View style={styles.teamLineupSection}>
            <View style={styles.teamLineupHeader}>
              <ThemedText variant="primary" size="l" weight="bold">
                {t('roomDetail.teamLineup')} ({displayRoom.filledSlots}/{displayRoom.totalSlots})
              </ThemedText>
              {/* SignalR Connection Indicator */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View 
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: isSignalRConnected ? theme.colors.neonGreen : theme.colors.textSecondary,
                    marginRight: 4,
                  }}
                />
                <ThemedText variant="secondary" size="xs">
                  {isSignalRConnected ? 'Live' : 'Offline'}
                </ThemedText>
              </View>
            </View>

            {/* Team A */}
            <View style={styles.teamContainer}>
              <View style={styles.teamHeader}>
                <ThemedIcon name="shield" size={20} variant="accent" />
                <ThemedText variant="accent" size="m" weight="bold" style={styles.teamName}>
                  Team A
                </ThemedText>
                {currentUserParticipant?.teamAssignment === 'A' && (
                  <View 
                    style={[
                      styles.selectedTeamBadge,
                      { backgroundColor: theme.colors.neonGreen + '30' }
                    ]}
                  >
                    <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>
                      Your Team
                    </ThemedText>
                  </View>
                )}
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.playersScrollContainer}
              >
                {displayRoom.participants.teamA.map((participant) => (
                  <ParticipantCard
                    key={participant.participantId}
                    participant={participant}
                    teamColor="#4CAF50"
                    isHost={isHost}
                    currentUserId={user?.userId}
                    isKicking={isKicking}
                    onKickPlayer={handleKickPlayer}
                  />
                ))}
                {/* Add empty slots for Team A - always show when team has room so user can switch teams */}
                {displayRoom.participants.teamA.length < displayRoom.totalSlots / 2 && (
                  <EmptySlotCard
                    teamAssignment="A"
                    teamColor="#4CAF50"
                    isJoining={isUpdatingParticipant && pendingTeamAssignment === 'A'}
                    onPress={handleOpenPositionModal}
                  />
                )}
              </ScrollView>
            </View>

            {/* Team B */}
            <View style={styles.teamContainer}>
              <View style={styles.teamHeader}>
                <ThemedIcon name="shield" size={20} variant="accent" />
                <ThemedText variant="accent" size="m" weight="bold" style={styles.teamName}>
                  Team B
                </ThemedText>
                {currentUserParticipant?.teamAssignment === 'B' && (
                  <View 
                    style={[
                      styles.selectedTeamBadge,
                      { backgroundColor: theme.colors.neonGreen + '30' }
                    ]}
                  >
                    <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>
                      Your Team
                    </ThemedText>
                  </View>
                )}
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.playersScrollContainer}
              >
                {displayRoom.participants.teamB.map((participant) => (
                  <ParticipantCard
                    key={participant.participantId}
                    participant={participant}
                    teamColor="#2196F3"
                    isHost={isHost}
                    currentUserId={user?.userId}
                    isKicking={isKicking}
                    onKickPlayer={handleKickPlayer}
                  />
                ))}
                {/* Add empty slots for Team B - always show when team has room so user can switch teams */}
                {displayRoom.participants.teamB.length < displayRoom.totalSlots / 2 && (
                  <EmptySlotCard
                    teamAssignment="B"
                    teamColor="#2196F3"
                    isJoining={isUpdatingParticipant && pendingTeamAssignment === 'B'}
                    onPress={handleOpenPositionModal}
                  />
                )}
              </ScrollView>
            </View>

            {/* Unassigned Players */}
            {displayRoom.participants.unassigned.length > 0 && (
              <View style={styles.teamContainer}>
                <View style={styles.teamHeader}>
                  <ThemedIcon name="people" size={20} variant="secondary" />
                  <ThemedText variant="secondary" size="m" weight="bold" style={styles.teamName}>
                    Unassigned
                  </ThemedText>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.playersScrollContainer}
                >
                  {displayRoom.participants.unassigned.map((participant) => (
                    <ParticipantCard
                      key={participant.participantId}
                      participant={participant}
                      teamColor="#9E9E9E"
                      isHost={isHost}
                      currentUserId={user?.userId}
                      isKicking={isKicking}
                      onKickPlayer={handleKickPlayer}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
            </>
          )}

          {/* Host Info Tab Content */}
          {activeTab === 'host' && displayRoom.host && (
            <View>
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Host Information
              </ThemedText>
              
              <ThemedCard style={styles.hostCard}>
                <View style={styles.hostHeader}>
                  <Image
                    source={{ uri: displayRoom.host.avatarUrl || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(displayRoom.host.fullName) }}
                    style={styles.hostAvatar}
                  />
                  <View style={styles.hostInfo}>
                    <ThemedText size="xl" weight="bold" style={styles.hostName}>
                      {displayRoom.host.fullName}
                    </ThemedText>
                    <ThemedText variant="secondary" size="s">
                      Host ID: {displayRoom.host.userId.slice(0, 8)}...
                    </ThemedText>
                  </View>
                </View>

                {/* Room Description */}
                {displayRoom.description && (
                  <View style={styles.hostBio}>
                    <ThemedText variant="secondary" size="xs" style={{ marginBottom: 4 }}>
                      Description
                    </ThemedText>
                    <ThemedText size="m">
                      {displayRoom.description}
                    </ThemedText>
                  </View>
                )}

                {/* Room Rules */}
                {displayRoom.rules && (
                  <View style={[styles.hostBio, { marginTop: 12 }]}>
                    <ThemedText variant="secondary" size="xs" style={{ marginBottom: 4 }}>
                      Rules
                    </ThemedText>
                    <ThemedText size="m">
                      {displayRoom.rules}
                    </ThemedText>
                  </View>
                )}

                {/* Contact via venue */}
                {displayRoom.field.venue.contactPhone && (
                  <View style={styles.hostContact}>
                    <View 
                      style={[
                        styles.hostContactItem,
                        { backgroundColor: theme.colors.neonGreen + '10' }
                      ]}
                    >
                      <ThemedText variant="secondary" size="xs" style={styles.contactLabel}>
                        Venue Contact
                      </ThemedText>
                      <ThemedText size="s" weight="medium">
                        {displayRoom.field.venue.contactPhone}
                      </ThemedText>
                    </View>
                  </View>
                )}
              </ThemedCard>
            </View>
          )}

          {/* Venue Details Tab Content */}
          {activeTab === 'venue' && displayRoom.field && (
            <View>
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Venue & Field Details
              </ThemedText>

              {/* Venue Info Cards */}
              <View style={styles.venueInfoContainer}>
                {/* Field Info */}
                <ThemedCard style={styles.venueLocationCard}>
                  <View style={styles.venueInfoHeader}>
                    <ThemedIcon name="football" size={20} variant="accent" />
                    <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                      Field
                    </ThemedText>
                  </View>
                  <ThemedText size="l" weight="semiBold">
                    {displayRoom.field.fieldName}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s">
                    Type: {displayRoom.field.fieldType === 'FiveVsFive' ? '5v5' : displayRoom.field.fieldType === 'SevenVsSeven' ? '7v7' : displayRoom.field.fieldType}
                  </ThemedText>
                </ThemedCard>

                {/* Price */}
                <View style={styles.venueInfoRow}>
                  <ThemedCard style={styles.venueInfoCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="cash" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" style={styles.venueInfoLabel}>
                        Field Rate/Hour
                      </ThemedText>
                    </View>
                    <ThemedText size="xl" weight="bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRoom.field.hourlyRate)}
                    </ThemedText>
                  </ThemedCard>

                  <ThemedCard style={styles.venueInfoCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="time" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" style={styles.venueInfoLabel}>
                        Duration
                      </ThemedText>
                    </View>
                    <ThemedText size="xl" weight="bold">
                      {displayRoom.durationMinutes} min
                    </ThemedText>
                  </ThemedCard>
                </View>

                {/* Venue Info */}
                <ThemedCard style={styles.venueLocationCard}>
                  <View style={styles.venueInfoHeader}>
                    <ThemedIcon name="business" size={20} variant="accent" />
                    <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                      Venue
                    </ThemedText>
                  </View>
                  <ThemedText size="l" weight="semiBold">
                    {displayRoom.field.venue.venueName}
                  </ThemedText>
                </ThemedCard>

                {/* Location */}
                <ThemedCard style={styles.venueLocationCard}>
                  <View style={styles.venueInfoHeader}>
                    <ThemedIcon name="location" size={20} variant="accent" />
                    <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                      Address
                    </ThemedText>
                  </View>
                  <ThemedText variant="secondary" size="m">
                    {displayRoom.field.venue.address}
                  </ThemedText>
                </ThemedCard>

                {/* Contact */}
                {displayRoom.field.venue.contactPhone && (
                  <ThemedCard style={styles.venueLocationCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="call" size={20} variant="accent" />
                      <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                        Contact
                      </ThemedText>
                    </View>
                    <ThemedText size="m">
                      {displayRoom.field.venue.contactPhone}
                    </ThemedText>
                  </ThemedCard>
                )}
              </View>
            </View>
          )}
        </View>
      </ThemedScrollView>

      {/* Host Menu Modal */}
      {isHost && (
        <HostMenuModal
          visible={showMenuModal}
          handleShowMenuModal={() => setShowMenuModal(false)}
          room={displayRoom}
          handleCancelRoom={handleCancelRoom}
          isCancelling={isCancelling}
        />
      )}
    
      {/* Position Selection Modal */}
      <PositionSelectionModal
        visible={showPositionModal}
        onClose={handleClosePositionModal}
        onSelectPosition={handlePositionSelected}
        teamAssignment={pendingTeamAssignment || 'A'}
        isLoading={isUpdatingParticipant}
      />

      {/* Join Button - Only show on Teams tab */}
      {activeTab === 'teams' && (
      <View 
        style={[
          styles.joinButtonContainer,
          { 
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.joinButton,
            {
              backgroundColor: currentUserParticipant ? theme.colors.neonGreen : theme.colors.border,
              shadowColor: currentUserParticipant ? theme.colors.neonGreen : 'transparent',
            }
          ]}
          onPress={handleJoinMatch}
          disabled={!currentUserParticipant || isUpdatingParticipant}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            style={[
              styles.joinButtonText,
              { color: currentUserParticipant ? '#000' : theme.colors.textSecondary }
            ]}
          >
            {isUpdatingParticipant 
              ? 'Joining...' 
              : currentUserParticipant 
                ? t('roomDetail.joinButton') 
                : 'Join a team first'
            }
          </ThemedText>
        </TouchableOpacity>
      </View>
      )}
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  roomInfoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 4,
  },
  teamLineupSection: {
    marginBottom: 24,
  },
  teamLineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamContainer: {
    marginBottom: 24,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  teamName: {
    marginLeft: 4,
  },
  selectedTeamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playersScrollContainer: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  hostCard: {
    padding: 20,
    borderRadius: 16,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    marginBottom: 4,
  },
  hostRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostRatingText: {
    marginLeft: 4,
  },
  hostBio: {
    marginBottom: 16,
  },
  hostContact: {
    flexDirection: 'row',
    gap: 12,
  },
  hostContactItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  contactLabel: {
    marginBottom: 4,
  },
  venueImagesContainer: {
    marginBottom: 24,
  },
  venueImageWrapper: {
    width: 350,
    marginRight: 10,
  },
  venueImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  imageIndicator: {
    height: 8,
    borderRadius: 4,
  },
  venueInfoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  venueInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  venueInfoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  venueInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueInfoLabel: {
    marginLeft: 8,
  },
  venueLocationCard: {
    padding: 16,
    borderRadius: 16,
  },
  venueCoordinates: {
    marginTop: 4,
  },
  venueAmenitiesCard: {
    padding: 16,
    borderRadius: 16,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  joinButton: {
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RoomInformationScreen;
