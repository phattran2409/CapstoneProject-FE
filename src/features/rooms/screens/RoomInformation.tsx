import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
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
} from '@/shared/components/themed';
import Alert from "@/shared/components/Alert";
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
  PositionSelectionModal,
  RoomInfoCard,
  HostTabContent,
  VenueTabContent,
  TeamLineup,
  MatchCountdown,
  type PlayerPosition,
  InviteFriendsModal,
} from '../components';
import { useMatchRoomSignalR, useMatchRoomSignalRHandlers, useAlert } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';

type RoomInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

interface RoomInformationScreenProps {
  navigation?: RoomInformationScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'RoomInformation'>;
}

// ==================== Main Screen Component ====================
const RoomInformationScreen: React.FC<RoomInformationScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId, venuePhotos: venuePhotosFromParams } = route?.params ?? {};
  const nav = useNavigation<RoomInformationScreenNavigationProp>();
  
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
  
  // ✅ Custom alert & toast
  const {
    visible: alertVisible,
    alertOptions,
    showDanger,
    showInfo,
    showSuccess,
    showConfirm,
    hideAlert,
  } = useAlert();
  const [roomData, setRoomData] = useState<MatchRoomFullInfo | null>(null);
  
  // ✅ Sync room data from React Query
  useEffect(() => {
    if (room) {
      setRoomData(room);
    }
  }, [room]);
  
  // ✅ Use roomData for display (có real-time updates) hoặc fallback về room từ query
  const displayRoom = roomData || room;

  // ✅ Venue photos: ưu tiên từ API detail, fallback từ params (khi navigate từ MatchesScreen)
  const venuePhotosToShow = useMemo(
    () => displayRoom?.venuePhotos?.length ? displayRoom.venuePhotos! : (venuePhotosFromParams ?? []),
    [displayRoom?.venuePhotos, venuePhotosFromParams],
  );

  // ==================== Deposit progress (realtime) ====================
  const depositTargetTotal = useMemo(() => {
    if (!displayRoom) return 0;
    // Tổng deposit cần thu để đủ trận (tính theo totalSlots)
    return (displayRoom.depositPerPerson || 0) * (displayRoom.totalSlots || 0);
  }, [displayRoom]);

  const depositCollected = displayRoom?.totalDepositCollected || 0;

  const depositProgress = useMemo(() => {
    if (!depositTargetTotal) return 0;
    return Math.max(0, Math.min(1, depositCollected / depositTargetTotal));
  }, [depositCollected, depositTargetTotal]);
  
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

  // ✅ User must choose Team A/B (not Unassigned) before joining match screen
  const hasSelectedTeam =
    currentUserParticipant?.teamAssignment === "A" ||
    currentUserParticipant?.teamAssignment === "B";

  const canJoinMatch = !!currentUserParticipant && hasSelectedTeam;

  // ✅ Selected team (A, B, or null)
  const [selectedTeam, setSelectedTeam] = useState<TeamAssignment | null>(null);
  
  // ✅ Local UI state
  const [activeTab, setActiveTab] = useState<'teams' | 'host' | 'venue'>('teams');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [inviteFriendsVisible, setInviteFriendsVisible] = useState(false);
  
  // ✅ Position selection modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingTeamAssignment, setPendingTeamAssignment] = useState<'A' | 'B' | null>(null);

  // ==================== SignalR Integration ====================
  
  // ✅ Toast hook for notifications
  const toast = useToast();

  console.log('', displayRoom);
  
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
      showDanger(
        'Bạn đã bị kick',
        payload.reason || 'Bạn đã bị kick khỏi phòng bởi host',
        () => {
          if (navigation?.canGoBack()) {
            navigation.goBack();
          } else {
            nav.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          }
        },
      );
    }
  }, [user?.userId, navigation, nav, showDanger, nav]);

  /**
   * Callback khi room bị xóa - điều hướng về trang trước
   */
  const handleRoomDeleted = useCallback(() => {
    showInfo(
      'Phòng đã bị xóa',
      'Phòng đã bị xóa bởi host hoặc đã hết người chơi.',
      () => {
        if (navigation?.canGoBack()) {
          navigation.goBack();
        } else {
          nav.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }
      },
      false,
    );
  }, [navigation, nav, showInfo]);

  /**
   * Callback khi host thay đổi
   */
  const handleHostChanged = useCallback((newHostId: string) => {
    // Refetch để lấy thông tin host mới đầy đủ
    refetch();
    
    // Nếu user hiện tại trở thành host
    if (newHostId === user?.userId) {
      showSuccess(
        'Bạn đã trở thành Host!',
        'Host cũ đã rời khỏi phòng. Bạn được chỉ định làm host mới.',
      );
    }
  }, [user?.userId, refetch, showSuccess]);

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
      showInfo('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để tham gia phòng');
      return;
    }

    // User phải là participant (đã join vào Unassigned từ MatchesScreen)
    if (!currentUserParticipant) {
      showInfo('Chưa tham gia', 'Bạn cần tham gia phòng trước khi chọn đội');
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
      showInfo(
        "Bạn chưa tham gia phòng",
        "Bạn cần tham gia phòng trước khi vào màn đội hình",
      );
      return;
    }

    if (!hasSelectedTeam) {
      showInfo(
        "Chọn đội trước khi vào sân",
        "Vui lòng chọn Team A hoặc Team B rồi mới vào màn đội hình.",
      );
      return;
    }

    // Ưu tiên team hiện tại (A/B) – tới đây chắc chắn không còn Unassigned
    const currentTeam = currentUserParticipant.teamAssignment === "B" ? "B" : "A";
    navigation?.navigate("Team", { roomId, team: currentTeam });
  };

  // ✅ Handle kick player (host only)
  const handleKickPlayer = (userId: string, playerName: string) => {
    showDanger(
      'Kick Player',
      `Are you sure you want to kick ${playerName} from the room?`,
      () => {
        kickPlayer(
          { roomId, playerId: userId },
          {
            onSuccess: () => {
              showSuccess('Success', 'Player has been kicked from the room');
              refetch();
            },
            onError: (error: any) => {
              showDanger('Error', error.message || 'Failed to kick player', () => {});
            },
          }
        );
      },
      undefined,
      'Kick',
      'Cancel',
    );
  };

  // ✅ Handle cancel room (host only)
  const handleCancelRoom = () => {
    showDanger(
      'Cancel Room',
      'Are you sure you want to cancel this room? This action cannot be undone.',
      () => {
        cancelRoom(roomId, {
          onSuccess: () => {
            showSuccess('Success', 'Room has been cancelled', () => {
              navigation?.goBack();
            });
          },
          onError: (error: any) => {
            showDanger('Error', error.message || 'Failed to cancel room', () => {});
          },
        });
      },
      undefined,
      'Yes, Cancel',
      'No',
    );
  };

  // ✅ Handle leave room
  const handleLeaveRoom = () => {
    showConfirm(
      t('roomDetail.leaveRoomTitle', 'Rời phòng'),
      t('roomDetail.leaveRoomMessage', 'Bạn có chắc muốn rời khỏi phòng này?'),
      () => {
        leaveMatchRoom(roomId, {
          onSuccess: () => {
            toast.success(
              t('roomDetail.leaveRoomSuccess', 'Rời phòng'),
              t('roomDetail.leaveRoomSuccessDesc', 'Bạn đã rời khỏi phòng'),
            );
            handleGoBack();
          },
          onError: (error: any) => {
            toast.error(
              t('common.error', 'Lỗi'),
              error.message || t('roomDetail.leaveRoomError', 'Không thể rời phòng'),
            );
          },
        });
      },
      undefined,
      t('roomDetail.leaveRoomConfirm', 'Rời phòng'),
      t('common.cancel', 'Hủy'),
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

  const shareUrl = `kickify://room/${displayRoom.roomId}`;
  const shareMessage = `Join my football match!\n\nFormat: ${displayRoom.matchFormat}\nDate: ${formatDate(
    displayRoom.matchDate,
    'short',
  )} ${displayRoom.startTime} - ${displayRoom.endTime}\nVenue: ${
    displayRoom.field.venue.venueName
  }\n\nJoin here: ${shareUrl}`;

  console.log('displayRoom', displayRoom.matchDate, displayRoom.startTime, displayRoom.endTime);

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
          <TouchableOpacity
            onPress={() => {
              setInviteFriendsVisible(true);
            }}
            style={styles.menuButton}
          >
            <Ionicons
              name="people-outline"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
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

      {/* Countdown dưới header khi trận đang InProgress */}
      {
        displayRoom.status == 'InProgress' &&(
        <MatchCountdown
          matchDate={displayRoom.matchDate}
          startTime={displayRoom.startTime}
          endTime={displayRoom.endTime}
          status={displayRoom.status}
          variant="inline"
        />
        )
      }
      {
        displayRoom.status == 'Locked' && (
          <MatchCountdown
            matchDate={displayRoom.matchDate}
            startTime={displayRoom.startTime}
            endTime={displayRoom.startTime}
            status={displayRoom.status}
            variant="overlay"
          />
        )
      }
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
            <RoomInfoCard
              icon="people"
              label={t('roomDetail.format')}
              value={displayRoom.matchFormat === 'FiveVsFive' ? '5v5' : displayRoom.matchFormat === 'SevenVsSeven' ? '7v7' : displayRoom.matchFormat}
              valueSize="xl"
              valueWeight="bold"
            />
            <RoomInfoCard
              icon="time"
              label={t('roomDetail.datetime')}
              value={`${new Date(displayRoom.matchDate).toLocaleDateString('vi-VN')} • ${displayRoom.startTime} - ${displayRoom.endTime}`}
            />
            <RoomInfoCard
              icon="location"
              label={t('roomDetail.venue')}
              value={`${displayRoom.field.fieldName} - ${displayRoom.field.venue.venueName}`}
              subValue={displayRoom.field.venue.address}
              valueSize="m"
              valueWeight="medium"
            />
            <RoomInfoCard
              icon="cash"
              label="Deposit / Person"
              value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRoom.depositPerPerson)}
            />
            <RoomInfoCard
              icon="trophy"
              label="Tổng tiền đã thu"
              value={formatCurrency(depositCollected, 'VND') || '0'}
              subtitle={depositTargetTotal > 0 ? `${Math.round(depositProgress * 100)}% quỹ trận đấu` : undefined}
            />
          </View>

          {/* Team Lineup Section */}
          <TeamLineup
            displayRoom={displayRoom}
            t={t}
            isSignalRConnected={isSignalRConnected}
            currentUserParticipant={currentUserParticipant}
            isHost={isHost}
            currentUserId={user?.userId}
            isKicking={isKicking}
            onKickPlayer={handleKickPlayer}
            isUpdatingParticipant={isUpdatingParticipant}
            pendingTeamAssignment={pendingTeamAssignment}
            onOpenPositionModal={handleOpenPositionModal}
            onParticipantPress={(userId) => navigation?.navigate('PersonalPage', { userId })}
          />
            </>
          )}

          {/* Host Info Tab Content */}
          {activeTab === 'host' && displayRoom.host && (
            <HostTabContent displayRoom={displayRoom} />
          )}

          {/* Venue Details Tab Content */}
          {activeTab === 'venue' && displayRoom.field && (
            <VenueTabContent
              displayRoom={displayRoom}
              venuePhotosToShow={venuePhotosToShow}
              selectedImageIndex={selectedImageIndex}
              onImageIndexChange={setSelectedImageIndex}
            />
          )}
        </View>
      </ThemedScrollView>

      {/* Global Alert component for this screen */}
      {alertOptions && (
        <Alert
          visible={alertVisible}
          type={alertOptions.type}
          title={alertOptions.title}
          message={alertOptions.message}
          confirmText={alertOptions.confirmText}
          cancelText={alertOptions.cancelText}
          onConfirm={alertOptions.onConfirm}
          onCancel={alertOptions.onCancel}
          onClose={alertOptions.onClose ?? hideAlert}
          showCloseButton={alertOptions.showCloseButton}
          autoClose={alertOptions.autoClose}
          autoCloseDelay={alertOptions.autoCloseDelay}
        />
      )}

      {/* Invite Friends Modal */}
      <InviteFriendsModal
        visible={inviteFriendsVisible}
        shareMessage={shareMessage}
        onClose={() => setInviteFriendsVisible(false)}
      />

      {/* Host Menu Modal */}
      {isHost && (
        <HostMenuModal
          visible={showMenuModal}
          handleShowMenuModal={() => setShowMenuModal(false)}
          room={{
            roomId: displayRoom.roomId,
            roomName: displayRoom.roomName || '',
            format: displayRoom.matchFormat,
            datetime: formatDate(displayRoom.matchDate, 'short'),
            venueName: displayRoom.field.venue.venueName,
          }}
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
              backgroundColor: canJoinMatch ? theme.colors.neonGreen : theme.colors.border,
              shadowColor: canJoinMatch ? theme.colors.neonGreen : 'transparent',
            }
          ]}
          onPress={handleJoinMatch}
          disabled={!canJoinMatch || isUpdatingParticipant}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            style={[
              styles.joinButtonText,
              { color: canJoinMatch ? '#000' : theme.colors.textSecondary }
            ]}
          >
            {isUpdatingParticipant 
              ? t('roomDetail.teamJoinButton.joining')
              : !currentUserParticipant
                ? t('roomDetail.teamJoinButton.joinFirst')
                : hasSelectedTeam
                  ? t('roomDetail.teamJoinButton.join')
                  : t('roomDetail.teamJoinButton.joinFirst')
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
  floatingDepositBadge: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
    zIndex: 9999,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  floatingDepositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  floatingDepositProgressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 6,
  },
  floatingDepositProgressFill: {
    height: 6,
    borderRadius: 999,
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
