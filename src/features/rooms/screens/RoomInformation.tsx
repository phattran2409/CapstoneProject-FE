import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { View, TouchableOpacity, AppState, AppStateStatus, RefreshControl } from 'react-native';
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
  type TeamAssignment,
  formatMatchFormatVsLabel,
  SuggestedPlayerProfile,
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
  AutoCloseCountdown,
  OpenRoomPolicyBanner,
  CheckInButton,
  type PlayerPosition,
  InviteFriendsModal,
  TransferHostModal,
  HostTransferRequestDialog,
  AIRecommendationModal,
  type MatchRecommendation,
} from '../components';
import type { HostTransferRequestPayload } from '../components/HostTransferRequestDialog';
import { useResponseTransferHost } from '../hooks/useTransferHost';
import { RoomStatusActionBar } from '../components/roomInformation/RoomStatusActionBar';
import { useMatchRoomSignalR, useAlert } from '@/shared/hooks';
import { useToast } from '@/shared/toast';
import { formatCurrency, formatDate } from '@/shared/utils/formatters';
import { useFeedbackSessionStore } from '@/features/feedback';
import { applyRoomFeedbackTestOverrides } from '@/features/rooms/dev/roomFeedbackTestOverrides';
import { getTranslatedError } from '@/shared/utils/errorTranslations';
import {
  useGoBackOrResetToMainTabs,
  useRoomInformationSignalRHandlers,
  useInviteFriend,
} from '../hooks';
import { styles } from './styles/RoomInformation.styles';
import { getRoomAutoClosePolicy } from '../utils/roomAutoClosePolicy';
import { useSuggestPlayers } from '../hooks/useSuggestAI';

type RoomInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

interface RoomInformationScreenProps {
  navigation?: RoomInformationScreenNavigationProp;
  route: RouteProp<RootStackParamList, 'RoomInformation'>;
}

// ==================== Main Screen Component ====================
const RoomInformationScreen: React.FC<RoomInformationScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const {
    roomId,
    venuePhotos: venuePhotosFromParams,
    viewAsOthersMatchHistory = false,
  } = route?.params ?? {};
  /** Mở phòng từ lịch sử profile người khác — chỉ xem, không thao tác phòng */
  const roomActionsBlocked = viewAsOthersMatchHistory;
  const nav = useNavigation<RoomInformationScreenNavigationProp>();
  const handleGoBack = useGoBackOrResetToMainTabs({ navigation, nav });
  
  // ✅ Use React Query hooks - sử dụng useMatchRoomDetail cho MatchRoomFullInfo
  const { data: room, isLoading, error, refetch } = useMatchRoomDetail(roomId);
  const { mutate: updateParticipant, isPending: isUpdatingParticipant } = useUpdateParticipant();
  const { mutate: leaveMatchRoom, isPending: isLeaving } = useLeaveMatchRoom();
  const { mutate: kickPlayer, isPending: isKicking } = useKickPlayer();
  const { mutate: suggestPlayers, isPending: isSuggestingPlayers } = useSuggestPlayers();
  const { mutate: inviteFriend, isPending: isInvitingFriend } = useInviteFriend();

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
  const roomAutoClosePolicy = useMemo(() => {
    if (!displayRoom) return null;
    return getRoomAutoClosePolicy(
      displayRoom.createdAt,
      displayRoom.matchDate,
      displayRoom.startTime,
    );
  }, [displayRoom]);

  const roomAutoCloseDeadlineLabel = useMemo(() => {
    if (!roomAutoClosePolicy) return "";
    return new Intl.DateTimeFormat(i18n.language || "vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(roomAutoClosePolicy.deadline);
  }, [i18n.language, roomAutoClosePolicy]);

  const depositProgress = useMemo(() => {
    if (!depositTargetTotal) return 0;
    return Math.max(0, Math.min(1, depositCollected / depositTargetTotal));
  }, [depositCollected, depositTargetTotal]);

  /**
   * Cửa sổ check-in mở khi:
   * - Room đang Locked hoặc InProgress (MatchCountdown đang hiện), hoặc
   * - Room vẫn Open nhưng còn <= 30 phút đến giờ bắt đầu (cùng logic parse của MatchCountdown)
   */
  const isCheckInWindowOpen = useMemo(() => {
    if (!displayRoom) return false;
    const { status, matchDate, startTime } = displayRoom;

    // Trận đang diễn ra → luôn cho check-in (dù đến muộn)
    if (status === 'InProgress') return true;

    // Chỉ mở cửa sổ check-in cho Open hoặc Locked khi còn ≤ 30 phút đến giờ bắt đầu
    if (status !== 'Open' && status !== 'Locked') return false;

    // Parse matchDate + startTime — giống parseTimeToDate trong MatchCountdown
    const date = new Date(matchDate);
    const [hh, mm] = (startTime ?? '').split(':').map(Number);
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return false;
    date.setHours(hh, mm, 0, 0);
    const msToStart = date.getTime() - Date.now();
    return msToStart > 0 && msToStart <= 30 * 60 * 1000; // ≤ 30 phút trước kickoff
  }, [displayRoom]);


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
  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [inviteFriendsVisible, setInviteFriendsVisible] = useState(false);
  const [aiPlayerRecommendations, setAiPlayerRecommendations] = useState<SuggestedPlayerProfile[]>([]);
  const [aiPlayerSuggestError, setAiPlayerSuggestError] = useState<string | null>(null);
  const [isOpenRoomPolicyExpanded, setIsOpenRoomPolicyExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // ✅ Position selection modal state
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingTeamAssignment, setPendingTeamAssignment] = useState<'A' | 'B' | null>(null);

  // ✅ Transfer host state
  const [transferHostVisible, setTransferHostVisible] = useState(false);
  const [transferRequest, setTransferRequest] = useState<HostTransferRequestPayload | null>(null);
  const { mutate: acceptTransfer, isPending: isAcceptingTransfer } = useResponseTransferHost();

  // ✅ Auto-close countdown state (nhận từ SignalR AutoCloseCountdownTick)
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number | null>(null);
  const [autoCloseTickAt, setAutoCloseTickAt] = useState<string>('');

  const handleAutoCloseCountdownTick = useCallback((payload: { secondsRemaining: number; tickAt: string; roomId: string; closesAtUtc: string; reason: string }) => {
    setAutoCloseSeconds(payload.secondsRemaining);
    setAutoCloseTickAt(payload.tickAt);
  }, []);

  // ==================== SignalR Integration ====================
  
  // ✅ Toast hook for notifications
  const toast = useToast();

  /** Toast khi BE báo chênh Elo: isSkillImbalanced === true (hai đội lệch trình độ đáng kể). */
  const prevSkillImbalanceFlagRef = useRef<boolean | undefined>(undefined);
  const skillImbalanceRoomIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!displayRoom) return;
    if (skillImbalanceRoomIdRef.current !== displayRoom.roomId) {
      skillImbalanceRoomIdRef.current = displayRoom.roomId;
      prevSkillImbalanceFlagRef.current = undefined;
    }
    const isImbalanced = displayRoom.isSkillImbalanced === true;
    if (isImbalanced && prevSkillImbalanceFlagRef.current !== true) {
      toast.warning(
        t('roomDetail.skillImbalancedTitle'),
        t('roomDetail.skillImbalancedMessage', {
          teamA: Math.round(displayRoom.teamAAverageElo ?? 0),
          teamB: Math.round(displayRoom.teamBAverageElo ?? 0),
        }),
      );
    }
    prevSkillImbalanceFlagRef.current = displayRoom.isSkillImbalanced;
  }, [
    displayRoom?.roomId,
    displayRoom?.isSkillImbalanced,
    displayRoom?.teamAAverageElo,
    displayRoom?.teamBAverageElo,
    toast,
    t,
  ]);

  const signalRHandlers = useRoomInformationSignalRHandlers({
    roomId,
    currentUserId: user?.userId,
    goBackOrResetToMainTabs: handleGoBack,
    refetch,
    setRoomData,
    setTransferRequest,
    showDanger,
    showInfo,
    showSuccess,
    toast,
    t,
    onAutoCloseCountdownTick: handleAutoCloseCountdownTick,
  });

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

  // ✅ Kết nối SignalR với handlers
  const { isConnected: isSignalRConnected, connectionState } = useMatchRoomSignalR(signalRHandlers);
  
  // Log connection state for debugging
  useEffect(() => {
    console.log('🔌 SignalR Connection State:', connectionState, 'Connected:', isSignalRConnected);
  }, [connectionState, isSignalRConnected]);

  // Ẩn auto-close countdown khi room không còn Open
  useEffect(() => {
    if (displayRoom?.status && displayRoom.status !== 'Open') {
      setAutoCloseSeconds(null);
    }
  }, [displayRoom?.status]);

  // AppState: khi app resume từ background → refetch để tránh lệch state do miss socket event
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'active') {
        refetch();
        // Reset countdown — chờ tick SignalR mới, tránh hiển thị giá trị cũ/sai
        setAutoCloseSeconds(null);
      }
    });
    return () => subscription.remove();
  }, [refetch]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

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
          if (feedbackSession.isHost) {
            navigation?.navigate('FeedbackMatchResult');
          } else {
            navigation?.navigate('FeedbackRating');
          }
          return;
        case 'playerRating':
          navigation?.navigate('FeedbackRating');
          return;
        case 'opponentRating':
          navigation?.navigate('FeedbackOpponentRating');
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

    // Đội đối phương để đánh giá tùy chọn
    const opponentPool =
      myTeam === 'A' ? displayRoom.participants.teamB : displayRoom.participants.teamA;
    const opponentFormationAssignments =
      myTeam === 'A'
        ? (displayRoom.formations?.teamB?.assignments ?? [])
        : (displayRoom.formations?.teamA?.assignments ?? []);
    const opponents = opponentPool.map((p) => {
      const formationSlot = opponentFormationAssignments.find(
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
      isHost,
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
      opponents,
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

  const teamAName =
    displayRoom?.formations?.teamA?.teamName ||
    displayRoom?.teamNames?.A ||
    t('roomDetail.teamA', 'Đội A');

  const teamBName =
    displayRoom?.formations?.teamB?.teamName ||
    displayRoom?.teamNames?.B ||
    t('roomDetail.teamB', 'Đội B');

  const aiMatchRecommendations = useMemo<MatchRecommendation[]>(() => {
    if (!displayRoom) return [];

    const missingPlayers = Math.max((displayRoom.totalSlots ?? 0) - (displayRoom.filledSlots ?? 0), 0);
    return [
      {
        id: displayRoom.roomId,
        title: displayRoom.roomName || `${teamAName} vs ${teamBName}`,
        venueName: displayRoom.field.venue.venueName,
        address: displayRoom.field.venue.address,
        startTime: displayRoom.startTime,
        endTime: displayRoom.endTime,
        format: formatMatchFormatVsLabel(displayRoom.matchFormat),
        missingPlayers,
        matchReason: t('aiRecommendation.match.cardReason', {
          date: formatDate(displayRoom.matchDate, 'short'),
          venue: displayRoom.field.venue.venueName,
        }),
      },
    ];
  }, [
    displayRoom,
    t,
    teamAName,
    teamBName,
  ]);

  const handleSubmitAiQuery = useCallback(() => {
    const trimmedQuery = aiQuery.trim();
    if (!displayRoom || !trimmedQuery) return;
    setAiPlayerSuggestError(null);
    suggestPlayers(
      {
        query: trimmedQuery,
        roomId: displayRoom.roomId,
        page: 1,
        pageSize: 10,
      },
      {
        onSuccess: (response) => {
          setAiPlayerSuggestError(null);
          const mappedPlayers: SuggestedPlayerProfile[] = (response.data.profiles || []).map(
            (profile) => ({
              profileId: profile.profileId,
              userId: profile.userId,
              userFullName: profile.userFullName,
              userEmail: profile.userEmail,
              userAvatarUrl: profile.userAvatarUrl,
              currentElo: profile.currentElo ?? 0,
              currentRank: profile.currentRank ?? '',
              isLegend: profile.isLegend ?? false,
              trustScore: profile.trustScore ?? 0,
              totalMatches: profile.totalMatches ?? 0,
              wins: profile.wins ?? 0,
              losses: profile.losses ?? 0,
              draws: profile.draws ?? 0,
              mvpCount: profile.mvpCount ?? 0,
              winStreak: profile.winStreak ?? 0,
              maxWinStreak: profile.maxWinStreak ?? 0,
              preferredPositions: profile.preferredPositions ?? '',
              preferredFoot: profile.preferredFoot ?? '',
              createdAt: profile.createdAt ?? '',
            }),
          );
          setAiPlayerRecommendations(mappedPlayers);
        },
        onError: (error: any) => {
          setAiPlayerSuggestError(
            getTranslatedError(error?.details.detail, error?.code) ||
              t('aiRecommendation.searching'),
          );
          setAiPlayerRecommendations([]);
        },
      },
    );
  }, [aiQuery, displayRoom, suggestPlayers, t]);

  const handleInvitePlayer = useCallback(
    (player: SuggestedPlayerProfile) => {
      if (!displayRoom) return;

      inviteFriend(
        {
          roomId: displayRoom.roomId,
          friendUserId: player.userId,
        },
        {
          onSuccess: () => {
            toast.success(
              t('roomDetail.notifications.success'),
              t('roomDetail.inviteFriendSuccess'),
            );
          },
          onError: (error: any) => {
            toast.error(
              t('common.error', 'Lỗi'),
              getTranslatedError(error?.message, error?.code) ||
                t('roomDetail.inviteFriendError'),
            );
          },
        },
      );
    },
    [displayRoom, inviteFriend, t, toast],
  );

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
  const shareMessage = t('roomDetail.shareMessage', {
    format: displayRoom.matchFormat,
    date: formatDate(displayRoom.matchDate, 'short'),
    time: `${displayRoom.startTime} - ${displayRoom.endTime}`,
    venue: displayRoom.field.venue.venueName,
    url: shareUrl,
  });

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
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <TouchableOpacity
              onPress={() => setAiModalVisible(true)}
              style={styles.menuButton}
            >
              <Ionicons name="sparkles" size={24} color={theme.colors.neonGreen}/>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowMenuModal(true)}
              style={styles.menuButton}
            >
              <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.textSecondary}/>
            </TouchableOpacity> 
          </View>
        </View>
        )} 
      </ThemedView>

      {(displayRoom.status === 'Locked' || displayRoom.status === 'InProgress') && (
        <MatchCountdown
          matchDate={displayRoom.matchDate}
          startTime={displayRoom.startTime}
          endTime={displayRoom.status === 'Locked' ? displayRoom.startTime : displayRoom.endTime}
          status={displayRoom.status}
        />
      )}

      {displayRoom.status === 'Open' && autoCloseSeconds !== null && autoCloseSeconds > 0 && (
        <AutoCloseCountdown
          secondsRemaining={autoCloseSeconds}
          tickAt={autoCloseTickAt}
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

      <ThemedScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.neonGreen]}
            tintColor={theme.colors.neonGreen}
          />
        }
      >
        <View style={styles.contentContainer}>
          {/* Teams Tab Content */}
          {activeTab === 'teams' && (
          <>
          {/* Open Room Policy Banner */}
          {displayRoom.status === 'Open' && (
            <OpenRoomPolicyBanner
              theme={theme}
              t={t as (key: string, options?: Record<string, unknown>) => string}
              isExpanded={isOpenRoomPolicyExpanded}
              onToggleExpanded={() => setIsOpenRoomPolicyExpanded((prev) => !prev)}
              deadlineLabel={roomAutoCloseDeadlineLabel}
              ruleLabel={
                roomAutoClosePolicy
                  ? t(`roomDetail.openRoomPolicyRule.${roomAutoClosePolicy.rule}`)
                  : ''
              }
            />
          )}
          {/* Room Info Section */}
          <View style={styles.roomInfoSection}>
            <RoomInfoCard
              icon="people"
              label={t('roomDetail.format')}
              value={formatMatchFormatVsLabel(displayRoom.matchFormat)}
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
              subtitle={
                depositTargetTotal > 0
                  ? `${Math.round(depositProgress * 100)}% ${t('roomDetail.depositProgress')}${
                      displayRoom.status === 'Open'
                        ? `\n${t('roomDetail.depositOpenHint')}`
                        : ''
                    }`
                  : displayRoom.status === 'Open'
                    ? t('roomDetail.depositOpenHint')
                    : undefined
              }
            />
            
          </View>
          {/* Team Lineup Section */}
          <TeamLineup
            displayRoom={displayRoom}
            teamAName={teamAName || t('roomDetail.teamA', 'Đội A')}
            teamBName={teamBName || t('roomDetail.teamB', 'Đội B')}
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

          {/* GPS Check-in – hiện khi cửa sổ 30 phút trước trận hoặc đang Locked/InProgress */}
          {isCheckInWindowOpen &&
            currentUserParticipant &&
            !roomActionsBlocked && (
              <View style={{ paddingHorizontal: 4, marginTop: 4 }}>
                <ThemedText
                  size="m"
                  weight="bold"
                  style={{ marginBottom: 4 }}
                >
                  {t('checkIn.sectionTitle')}
                </ThemedText>
                <CheckInButton
                  roomId={displayRoom.roomId}
                  hasCheckedIn={!!currentUserParticipant.checkInMethod}
                  distanceFromVenueMeters={currentUserParticipant.distanceFromVenueMeters}
                />
              </View>
            )}
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
              onViewVenueDetail={() =>
                navigation?.navigate('VenueDetail', {
                  venueId: displayRoom.field.venue.venueId,
                })
              }
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
        inviteToRoom
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
        t={t}
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

      <AIRecommendationModal
        visible={aiModalVisible}
        mode="player"
        query={aiQuery}
        isLoading={isSuggestingPlayers || isInvitingFriend}
        errorMessage={aiPlayerSuggestError}
        playerRecommendations={aiPlayerRecommendations}
        onClose={() => {
          setAiQuery('');
          setAiPlayerSuggestError(null);
          setAiModalVisible(false);
        }}
        onChangeQuery={(value) => {
          setAiPlayerSuggestError(null);
          setAiQuery(value);
        }}
        onSubmitQuery={handleSubmitAiQuery}
        onInvitePlayer={(player) => handleInvitePlayer(player)}
      />
    </ThemedSafeAreaView>
  );
};

export default RoomInformationScreen;
