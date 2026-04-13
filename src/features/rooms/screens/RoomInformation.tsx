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
  TransferHostModal,
  HostTransferRequestDialog,
} from '../components';
import type { HostTransferRequestPayload } from '../components/HostTransferRequestDialog';
import { useResponseTransferHost, useTransferHost } from '../hooks/useTransferHost';
import { RoomStatusActionBar } from '../components/roomInformation/RoomStatusActionBar';
import { useMatchRoomSignalR, useMatchRoomSignalRHandlers, useAlert, HostTransferRejectedPayload, HostTransferredPayload } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { useFeedbackSessionStore } from '@/features/feedback';
import { applyRoomFeedbackTestOverrides } from '@/features/rooms/dev/roomFeedbackTestOverrides';
import { getTranslatedError } from '@/shared/utils/errorTranslations';

type RoomInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

interface RoomInformationScreenProps {
  navigation?: RoomInformationScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'RoomInformation'>;
}

// ==================== Main Screen Component ====================
const RoomInformationScreen: React.FC<RoomInformationScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    roomId,
    venuePhotos: venuePhotosFromParams,
    viewAsOthersMatchHistory = false,
  } = route?.params ?? {};
  /** Mở phòng từ lịch sử profile người khác — chỉ xem, không thao tác phòng */
  const roomActionsBlocked = viewAsOthersMatchHistory;
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
  // const { mutate: cancelRoom, isPending: isCancelling } = useCancelRoom();

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
  const displayRoom = useMemo(() => {
    const base = roomData || room;
    if (!base) return null;
    return applyRoomFeedbackTestOverrides(base);
  }, [roomData, room]);

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

  // ✅ Transfer host state
  const [transferHostVisible, setTransferHostVisible] = useState(false);
  const [transferRequest, setTransferRequest] = useState<HostTransferRequestPayload | null>(null);
  const { mutate: acceptTransfer, isPending: isAcceptingTransfer } = useResponseTransferHost();

  // ==================== SignalR Integration ====================
  
  // ✅ Toast hook for notifications
  const toast = useToast();
  /**
   * Callback hiển thị notification - sử dụng Toast thay vì Alert
   */
  const showNotification = useCallback((message: string, type?: 'success' | 'info' | 'warning' | 'error') => {
    switch (type) {
      case 'success':
        toast.success(t('roomDetail.notifications.success'), message);
        break;
      case 'error':
        toast.error(t('roomDetail.notifications.error'), message);
        break;
      case 'warning':
        toast.warning(t('roomDetail.notifications.warning'), message);
        break;
      case 'info':
      default:
        toast.info(t('roomDetail.notifications.info'), message);
        break;
    }
  }, [toast, t]);

  /**
   * Callback khi bị kick - điều hướng về trang trước
   */
  const handleKickedFromRoom = useCallback((payload: any) => {
    if (payload.kickedUserId === user?.userId) {
      showDanger(
        t('roomDetail.kicked'),
        payload.reason || t('roomDetail.kickedReason'),
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
  }, [user?.userId, navigation, nav, showDanger, t]);

  /**
   * Callback khi room bị xóa - điều hướng về trang trước
   */
  const handleRoomDeleted = useCallback(() => {
    showInfo(
      t('roomDetail.roomDeleted'),
      t('roomDetail.roomDeletedReason'),
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
  }, [navigation, nav, showInfo, t]);

  /**
   * Callback khi host thay đổi
   */
  const handleHostChanged = useCallback((newHostId: string) => {
    // Refetch để lấy thông tin host mới đầy đủ
    refetch();
    
    // Nếu user hiện tại trở thành host
    if (newHostId === user?.userId) {
      showSuccess(
        t('roomDetail.hostChanged'),
        t('roomDetail.hostChangedDesc'),
      );
    }
  }, [user?.userId, refetch, showSuccess, t]);

  /**
   * Callback khi nhận yêu cầu chuyển host qua SignalR
   */
  const handleHostTransferRequested = useCallback(
    (payload: HostTransferRequestPayload) => {
      setTransferRequest(payload);
    },
    [],
  );

  /**
   * Callback khi nhận yêu cầu chuyển host qua SignalR
   */
  const handleHostTransferRejected = useCallback(
    (payload: HostTransferRejectedPayload) => {
      setTransferRequest(null);
      toast.error(
        t('roomDetail.transferRejected'),
        t('roomDetail.transferRejectedDesc', { targetUserName: payload.targetUserName }),
      );
    },
    [ toast, t],
  );
  
  /**
   * Callback khi host chuyển quyền host thành công
   */
  const handleHostTransferred = useCallback(
    (payload: HostTransferredPayload) => {
      setTransferRequest(null);
      refetch();
      toast.success(
        t('roomDetail.transferAccepted'),
        t('roomDetail.transferAcceptedDesc', { newHostName: payload.newHostName }),
      );
    },
      [refetch, toast, t],
  );
  const handleAcceptTransfer = useCallback(() => {
    if (!transferRequest) return;
    acceptTransfer(
      { roomId: transferRequest.roomId, isAccepted: true },
      {
        onSuccess: () => {
          setTransferRequest(null);
          refetch();
          toast.success(
            t('roomDetail.transferAccepted')
          );
        },
        onError: (error: any) => {
          toast.error(
            t('common.error', 'Lỗi'),
            getTranslatedError(error?.message, error?.code) ||
              t('roomDetail.transferAcceptError', 'Không thể chấp nhận chuyển host'),
          );
        },
      },
    );
  }, [transferRequest, acceptTransfer, refetch, toast, t]);

  const handleRejectTransfer = useCallback(() => {
    if (!transferRequest) return;
    acceptTransfer(
      { roomId: transferRequest.roomId, isAccepted: false },
      {
        onSuccess: () => {
          setTransferRequest(null);
          toast.success(
            t('roomDetail.transferRejected')
          );
        },
        onError: (error: any) => {
          toast.error(
            t('common.error', 'Lỗi'),
            getTranslatedError(error?.message, error?.code) ||
              t('roomDetail.transferRejectError'),
          );
        },
      },
    );
  }, [transferRequest , toast, t]);

  // ✅ Tạo SignalR handlers
  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: user?.userId,
    setRoomData,
    showNotification,
    onKicked: handleKickedFromRoom,
    onRoomDeleted: handleRoomDeleted,
    onHostChanged: handleHostChanged,
    onHostTransferRequested: handleHostTransferRequested,
    onHostTransferRejected: handleHostTransferRejected,
    onHostTransferred: handleHostTransferred,
  });

  // ✅ Kết nối SignalR với handlers
  const { isConnected: isSignalRConnected, connectionState } = useMatchRoomSignalR(signalRHandlers);
  
  // Log connection state for debugging
  useEffect(() => {
    console.log('🔌 SignalR Connection State:', connectionState, 'Connected:', isSignalRConnected);
  }, [connectionState, isSignalRConnected]);

  // ✅ Handle open position selection modal
  const handleOpenPositionModal = (teamAssignment: TeamAssignment) => {
    if (roomActionsBlocked) return;

    if (!user) {
      showInfo(t('roomDetail.loginRequired'), t('roomDetail.loginRequiredDesc'));
      return;
    }

    // User phải là participant (đã join vào Unassigned từ MatchesScreen)
    if (!currentUserParticipant) {
      showInfo(t('roomDetail.joinFirst'), t('roomDetail.joinFirstDesc'));
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
    if (roomActionsBlocked) return;
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
            t('roomDetail.chooseTeamSuccess'),
            t('roomDetail.chooseTeamDesc', { team: pendingTeamAssignment, position }),
          );
          setSelectedTeam(pendingTeamAssignment);
          setShowPositionModal(false);
          setPendingTeamAssignment(null);
          refetch();
        },
        onError: (error: any) => {
          toast.error(
            t('roomDetail.notifications.error'),
            getTranslatedError(error?.message, error?.code) || t('roomDetail.chooseTeamError')
          );
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
    if (roomActionsBlocked) return;

    if (!currentUserParticipant) {
      showInfo(t('roomDetail.joinFirstRoom'), t('roomDetail.joinFirstRoomDesc'));
      return;
    }

    if (!hasSelectedTeam) {
      showInfo(t('roomDetail.selectTeamFirst'), t('roomDetail.selectTeamFirstDesc'));
      return;
    }

    // Ưu tiên team hiện tại (A/B) – tới đây chắc chắn không còn Unassigned
    const currentTeam = currentUserParticipant.teamAssignment === "B" ? "B" : "A";
    navigation?.navigate("Team", { roomId, team: currentTeam });
  };

  // ✅ Handle kick player (host only)
  const handleKickPlayer = (userId: string, playerName: string) => {
    if (roomActionsBlocked) return;

    showDanger(
      t('roomDetail.kickTitle'),
      t('roomDetail.kickMessage', { name: playerName }),
      () => {
        kickPlayer(
          { roomId, playerId: userId },
          {
            onSuccess: () => {
              showSuccess(t('roomDetail.kickSuccess'), t('roomDetail.kickSuccessDesc'));
              refetch();
            },
            onError: (error: any) => {
              showDanger(
                t('roomDetail.notifications.error'),
                getTranslatedError(error?.message, error?.code) || t('roomDetail.kickError'),
                () => {}
              );
            },
          }
        );
      },
      undefined,
      t('roomDetail.kickButton'),
      t('common.buttons.cancel'),
    );
  };
  // ✅ Handle leave room
  const handleLeaveRoom = () => {
    console.log('handleLeaveRoom');
    if (roomActionsBlocked) return;

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
              getTranslatedError(error?.message, error?.code) ||
                t('roomDetail.leaveRoomError', 'Không thể rời phòng'),
            );
          },
        });
      },
      undefined,
      t('roomDetail.leaveRoomConfirm'),
      t('common.buttons.cancel'),
    );
  };

  const { startSession, session: feedbackSession } = useFeedbackSessionStore();

  const handleNavigateToFeedbackIntro = async () => {
    if (!displayRoom || !user?.userId) return;
    if (roomActionsBlocked) return;

    if (feedbackSession?.roomId === displayRoom.roomId) {
      switch (feedbackSession.currentStep) {
        case 'intro':
          navigation?.navigate('FeedbackIntro', { roomId: displayRoom.roomId });
          return;
        case 'matchResult':
          navigation?.navigate('FeedbackMatchResult');
          return;
        case 'playerRating':
          navigation?.navigate('FeedbackRating');
          return;
        case 'fieldRating':
          navigation?.navigate('FeedbackFieldRating', {
            venueId: feedbackSession.venue?.venueId ?? displayRoom.field.venue.venueId,
          });
          return;
        case 'complete':
          navigation?.navigate('FeedbackComplete');
          return;
      }
    }

    const allParticipants = [
      ...displayRoom.participants.teamA,
      ...displayRoom.participants.teamB,
      ...displayRoom.participants.unassigned,
    ];
    const me = allParticipants.find((p) => p.userId === user.userId);
    const myTeam = me?.teamAssignment === 'A' || me?.teamAssignment === 'B'
      ? me.teamAssignment
      : 'A';

    // Lấy tên đội từ formations (ưu tiên) rồi đến teamNames
    const teamAName =
      displayRoom.formations?.teamA?.teamName ||
      displayRoom.teamNames?.A ||
      t('roomDetail.teamA', 'Đội A');
    const teamBName =
      displayRoom.formations?.teamB?.teamName ||
      displayRoom.teamNames?.B ||
      t('roomDetail.teamB', 'Đội B');

    // Lookup position từ formations assignments theo playerId
    const formationAssignments =
      myTeam === 'A'
        ? (displayRoom.formations?.teamA?.assignments ?? [])
        : (displayRoom.formations?.teamB?.assignments ?? []);

    // Đồng đội cùng đội, không bao gồm bản thân
    const teamPool =
      myTeam === 'A' ? displayRoom.participants.teamA : displayRoom.participants.teamB;
    const teammates = teamPool
      .filter((p) => p.userId !== user.userId)
      .map((p) => {
        const formationSlot = formationAssignments.find(
          (a) => a.playerId === p.userId,
        );
        return {
          userId: p.userId,
          fullName: p.fullName,
          avatarUrl: p.avatarUrl,
          position: formationSlot?.position ?? p.position,
          teamAssignment: p.teamAssignment as 'A' | 'B',
        };
      });

    await startSession({
      roomId: displayRoom.roomId,
      teamAName,
      teamBName,
      venue: {
        venueId: displayRoom.field.venue.venueId,
        fieldId: displayRoom.fieldId,
        fieldName: displayRoom.field.fieldName,
        venueName: displayRoom.field.venue.venueName,
        address: displayRoom.field.venue.address,
        photoUrls: (venuePhotosToShow ?? [])
          .map((p) => p.photoUrl)
          .filter(Boolean),
      },
      matchDate: displayRoom.matchDate,
      startTime: displayRoom.startTime,
      myTeam,
      teammates,
    });
    navigation?.navigate('FeedbackIntro', { roomId: displayRoom.roomId });  
  };

  const handleNavigateToEloBreakdown = () => {
    if (roomActionsBlocked) return;
    navigation?.navigate('EloBreakdown', {
      matchId: displayRoom?.roomId,
      matchLabel:
        displayRoom?.roomName ||
        `${displayRoom?.teamNames?.A ?? t('roomDetail.teamA', 'Team A')} vs ${displayRoom?.teamNames?.B ?? t('roomDetail.teamB', 'Team B')}`,
    });
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
            <ThemedText weight="bold" style={{ color: '#000' }}>{t('roomDetail.tryAgain')}</ThemedText>
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
          <ThemedText>{t('roomDetail.roomNotFound')}</ThemedText>
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

  const teamAName =
  displayRoom.formations?.teamA?.teamName ||
  displayRoom.teamNames?.A ||
  'Đội A';
const teamBName =
  displayRoom.formations?.teamB?.teamName ||
  displayRoom.teamNames?.B ||
  'Đội B';

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
          <View style={{  flex: displayRoom.status == 'Open' ? 0 : 1}}>
            <ThemedText size="xl" weight="bold" style={{ textAlign: displayRoom.status !== 'Open' ? 'center' : 'left' }}>
              {t('roomDetail.title')}
            </ThemedText>
          </View>
          {displayRoom.status !== 'Open' &&(
            <View style={{width : 30, height : 'auto'}}>
            </View>
          )}
        </View>
        {displayRoom.status === 'Open' && !roomActionsBlocked && (isHost || currentUserParticipant) && (
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowMenuModal(true)}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
        )} 
      </ThemedView>

      {/* Countdown dưới header khi trận Locked (đếm ngược đến giờ bắt đầu) hoặc InProgress (thời gian còn lại) */}
      {(displayRoom.status === 'Locked' || displayRoom.status === 'InProgress') && (
        <MatchCountdown
          matchDate={displayRoom.matchDate}
          startTime={displayRoom.startTime}
          endTime={displayRoom.status === 'Locked' ? displayRoom.startTime : displayRoom.endTime}
          status={displayRoom.status}
        />
      )}
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
            {t('roomDetail.teamsTab')}
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
            {t('roomDetail.hostInfoTab')}
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
            {t('roomDetail.venueTab')}
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
              mapLink={true}
              mapLatitude={displayRoom.field.venue.latitude}
              mapLongitude={displayRoom.field.venue.longitude}
            />
            <RoomInfoCard
              icon="cash"
              label={t('roomDetail.depositPerPerson')}
              value={new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayRoom.depositPerPerson)}
            />
            <RoomInfoCard
              icon="trophy"
              label={t('roomDetail.totalDepositCollected')}
              value={formatCurrency(depositCollected) || '0 VND'}
              subtitle={depositTargetTotal > 0 ? `${Math.round(depositProgress * 100)}% ${t('roomDetail.depositProgress')}` : undefined}
            />
            
          </View>

          {/* Team Lineup Section */}
          <TeamLineup
            displayRoom={displayRoom}
            teamAName={teamAName || 'Đội A'}
            teamBName={teamBName || 'Đội B'}
            t={t}
            isSignalRConnected={isSignalRConnected}
            currentUserParticipant={currentUserParticipant}
            isHost={isHost}
            hostId={displayRoom.hostId}
            currentUserId={user?.userId}
            isKicking={isKicking}
            onKickPlayer={handleKickPlayer}
            isUpdatingParticipant={isUpdatingParticipant}
            pendingTeamAssignment={pendingTeamAssignment}
            onOpenPositionModal={handleOpenPositionModal}
            onParticipantPress={(userId) => navigation?.navigate('PersonalPage', { userId })}
            roomActionsDisabled={roomActionsBlocked}
          />
            </>
          )}

          {/* Host Info Tab Content */}
          {activeTab === 'host' && displayRoom.host && (
            <HostTabContent displayRoom={displayRoom} t={t}/>
          )}

          {/* Venue Details Tab Content */}
          {activeTab === 'venue' && displayRoom.field && (
            <VenueTabContent
              displayRoom={displayRoom}
              venuePhotosToShow={venuePhotosToShow}
              selectedImageIndex={selectedImageIndex}
              onImageIndexChange={setSelectedImageIndex}
              t={t as (key: string, defaultValue?: string | object) => string}
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
        roomId={displayRoom.roomId}
        shareMessage={shareMessage}
        onClose={() => setInviteFriendsVisible(false)}
      />

      {/* Room menu: host (quản lý phòng) | player (mời bạn bè, rời phòng) */}
      {(isHost || currentUserParticipant) && !roomActionsBlocked && displayRoom.status === 'Open' && (
        <HostMenuModal
          variant={isHost ? 'host' : 'player'}
          visible={showMenuModal}
          handleShowMenuModal={() => setShowMenuModal(false)}
          room={{
            roomId: displayRoom.roomId,
            roomName: displayRoom.roomName || '',
            format: displayRoom.matchFormat,
            datetime: formatDate(displayRoom.matchDate, 'short'),
            venueName: displayRoom.field.venue.venueName,
            description: displayRoom.description,
            rules: displayRoom.rules,
          }}
          {...((isHost || currentUserParticipant) && !roomActionsBlocked
            ? {
                onInviteFriends: () => setInviteFriendsVisible(true),
                onLeaveRoom: handleLeaveRoom,
                isLeavingRoom: isLeaving,
              }
            : {})}
          onTransferHost={() => setTransferHostVisible(true)}
        />
      )}

      {/* Transfer Host Modal */}
      {isHost && displayRoom && user?.userId && (
        <TransferHostModal
          visible={transferHostVisible}
          onClose={() => setTransferHostVisible(false)}
          roomId={displayRoom.roomId}
          participants={[
            ...displayRoom.participants.teamA,
            ...displayRoom.participants.teamB,
            ...displayRoom.participants.unassigned,
          ]}
          currentUserId={user.userId}
        />
      )}

      {/* Host Transfer Request Dialog (target user nhận yêu cầu qua SignalR) */}
      <HostTransferRequestDialog
        visible={!!transferRequest}
        request={transferRequest}
        isAccepting={isAcceptingTransfer}
        onAccept={handleAcceptTransfer}
        onReject={handleRejectTransfer}
      />

      {/* Position Selection Modal */}
      <PositionSelectionModal
        visible={showPositionModal}
        onClose={handleClosePositionModal}
        onSelectPosition={handlePositionSelected}
        teamAssignment={pendingTeamAssignment || 'A'}
        isLoading={isUpdatingParticipant}
      />

      <RoomStatusActionBar
        hasLeftFeedback={currentUserParticipant?.hasLeftFeedback === true}
        status={displayRoom.status}
        activeTab={activeTab}
        canJoinMatch={canJoinMatch}
        isUpdatingParticipant={isUpdatingParticipant}
        currentUserParticipant={currentUserParticipant}
        hasSelectedTeam={hasSelectedTeam}
        onJoinMatch={handleJoinMatch}
        onNavigateToFeedbackIntro={handleNavigateToFeedbackIntro}
        onNavigateToEloBreakdown={handleNavigateToEloBreakdown}
        currentUserId={user?.userId ?? null}
        isViewingOthersMatchHistory={viewAsOthersMatchHistory}
      />
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
    justifyContent: 'center',
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
