import { useState, useCallback, useRef } from 'react';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import type { TFunction } from 'i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AutoCloseCountdownTickPayload } from '@/shared/hooks';
import { RootStackParamList } from '@/app/navigation/types';
import {
  type MatchRoomFullInfo,
  type TeamAssignment,
  type SuggestedPlayerProfile,
} from '@/features/rooms';
import type {
  SuggestPlayersRequest,
  SuggestPlayersResponse,
} from '../types/room.types';
import type { HostTransferRequestPayload } from '../components/HostTransferRequestDialog';
import type { PlayerPosition } from './useJoinMatchRoom';
import { useResponseTransferHost } from './useTransferHost';
import { useFeedbackSessionStore } from '@/features/feedback/store/feedbackSessionStore';
import { getTranslatedError } from '@/shared/utils/errorTranslations';
import { getAIThinkingText } from '@/shared/utils/geminiService';

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

type RoomNav = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

type ParticipantLike = {
  userId: string;
  fullName: string;
  avatarUrl?: string | null;
  position?: string | null;
  teamAssignment: string;
  checkInMethod?: string | null;
  distanceFromVenueMeters?: number | null;
  hasLeftFeedback?: boolean;
};

type MutationCallbacks = {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
};

export interface UseRoomInformationScreenHandlersParams {
  roomId: string;
  roomActionsBlocked: boolean;
  displayRoom: MatchRoomFullInfo | null;
  venuePhotosToShow: { photoUrl?: string | null }[];
  userId: string | undefined;
  currentUserParticipant: ParticipantLike | null;
  hasSelectedTeam: boolean;
  isHost: boolean;
  navigation: RoomNav | undefined;
  handleGoBack: () => void;
  refetch: () => void | Promise<unknown>;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
  updateParticipant: (
    variables: { roomId: string; teamAssignment: 'A' | 'B'; position: PlayerPosition },
    callbacks?: MutationCallbacks,
  ) => void;
  kickPlayer: (
    variables: { roomId: string; playerId: string },
    callbacks?: MutationCallbacks,
  ) => void;
  leaveMatchRoom: (roomId: string, callbacks?: MutationCallbacks) => void;
  suggestPlayers: UseMutateAsyncFunction<
    SuggestPlayersResponse,
    Error,
    SuggestPlayersRequest,
    unknown
  >;
  showDanger: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => void;
  showConfirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string,
    cancelText?: string,
  ) => void;
  showInfo: (
    title: string,
    message?: string,
    onConfirm?: () => void,
    autoClose?: boolean,
    autoCloseDelay?: number,
  ) => void;
  showSuccess: (title: string, message: string, onConfirm?: () => void) => void;
  t: TFunction;
}

export function useRoomInformationScreenHandlers({
  roomId,
  roomActionsBlocked,
  displayRoom,
  venuePhotosToShow,
  userId,
  currentUserParticipant,
  hasSelectedTeam,
  isHost,
  navigation,
  handleGoBack,
  refetch,
  toast,
  updateParticipant,
  kickPlayer,
  leaveMatchRoom,
  suggestPlayers,
  showDanger,
  showConfirm,
  showInfo,
  showSuccess,
  t,
}: UseRoomInformationScreenHandlersParams) {
  const { mutate: acceptTransfer, isPending: isAcceptingTransfer } = useResponseTransferHost();
  const { startSession, session: feedbackSession } = useFeedbackSessionStore();

  const [, setSelectedTeam] = useState<TeamAssignment | null>(null);

  const [showPositionModal, setShowPositionModal] = useState(false);
  const [pendingTeamAssignment, setPendingTeamAssignment] = useState<'A' | 'B' | null>(null);

  const [transferHostVisible, setTransferHostVisible] = useState(false);
  const [transferRequest, setTransferRequest] = useState<HostTransferRequestPayload | null>(null);

  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number | null>(null);
  const [autoCloseTickAt, setAutoCloseTickAt] = useState<string>('');

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [aiModalVisible, setAiModalVisible] = useState(false);
  const [aiQuery, setAiQuery] = useState('');
  const [aiPlayerRecommendations, setAiPlayerRecommendations] = useState<SuggestedPlayerProfile[]>(
    [],
  );
  const [aiPlayerSuggestError, setAiPlayerSuggestError] = useState<string | null>(null);
  const [aiThinkingText, setAiThinkingText] = useState<string | null>(null);
  const [isSuggestingPlayers, setIsSuggestingPlayers] = useState(false);
  const aiPlayerSuggestLockRef = useRef(false);

  const handleAutoCloseCountdownTick = useCallback((payload: AutoCloseCountdownTickPayload) => {
    setAutoCloseSeconds(payload.secondsRemaining);
    setAutoCloseTickAt(payload.tickAt);
  }, []);

  const handleAcceptTransfer = useCallback(() => {
    if (!transferRequest) return;
    acceptTransfer(
      { roomId: transferRequest.roomId, isAccepted: true },
      {
        onSuccess: () => {
          setTransferRequest(null);
          void refetch();
          toast.success(t('roomDetail.transferAccepted'));
        },
        onError: (error: unknown) => {
          const err = error as { message?: string; code?: string };
          toast.error(
            t('common.error', 'Lỗi'),
            getTranslatedError(err?.message, err?.code) ||
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
          toast.success(t('roomDetail.transferRejected'));
        },
        onError: (error: unknown) => {
          const err = error as { message?: string; code?: string };
          toast.error(
            t('common.error', 'Lỗi'),
            getTranslatedError(err?.message, err?.code) || t('roomDetail.transferRejectError'),
          );
        },
      },
    );
  }, [transferRequest, acceptTransfer, toast, t]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  const handleOpenPositionModal = useCallback(
    (teamAssignment: TeamAssignment) => {
      if (roomActionsBlocked) return;
      if (!userId) {
        showInfo(t('roomDetail.loginRequired'), t('roomDetail.loginRequiredDesc'));
        return;
      }
      if (!currentUserParticipant) {
        showInfo(t('roomDetail.joinFirst'), t('roomDetail.joinFirstDesc'));
        return;
      }
      if (teamAssignment === 'A' || teamAssignment === 'B') {
        setPendingTeamAssignment(teamAssignment);
        setShowPositionModal(true);
      }
    },
    [roomActionsBlocked, userId, currentUserParticipant, showInfo, t],
  );

  const handlePositionSelected = useCallback(
    (position: PlayerPosition) => {
      if (roomActionsBlocked) return;
      if (!pendingTeamAssignment || !displayRoom) return;
      updateParticipant(
        {
          roomId: displayRoom.roomId,
          teamAssignment: pendingTeamAssignment,
          position,
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
            void refetch();
          },
          onError: (error: unknown) => {
            const err = error as { message?: string; code?: string };
            toast.error(
              t('roomDetail.notifications.error'),
              getTranslatedError(err?.message, err?.code) || t('roomDetail.chooseTeamError'),
            );
            setShowPositionModal(false);
            setPendingTeamAssignment(null);
          },
        },
      );
    },
    [
      roomActionsBlocked,
      pendingTeamAssignment,
      displayRoom,
      updateParticipant,
      toast,
      t,
      refetch,
    ],
  );

  const handleClosePositionModal = useCallback(() => {
    setShowPositionModal(false);
    setPendingTeamAssignment(null);
  }, []);

  const handleJoinMatch = useCallback(() => {
    if (roomActionsBlocked) return;
    if (!currentUserParticipant) {
      showInfo(t('roomDetail.joinFirstRoom'), t('roomDetail.joinFirstRoomDesc'));
      return;
    }
    if (!hasSelectedTeam) {
      showInfo(t('roomDetail.selectTeamFirst'), t('roomDetail.selectTeamFirstDesc'));
      return;
    }
    const currentTeam = currentUserParticipant.teamAssignment === 'B' ? 'B' : 'A';
    navigation?.navigate('Team', { roomId, team: currentTeam });
  }, [
    roomActionsBlocked,
    currentUserParticipant,
    hasSelectedTeam,
    showInfo,
    t,
    navigation,
    roomId,
  ]);

  const handleKickPlayer = useCallback(
    (kickedUserId: string, playerName: string) => {
      if (roomActionsBlocked) return;
      showDanger(
        t('roomDetail.kickTitle'),
        t('roomDetail.kickMessage', { name: playerName }),
        () => {
          kickPlayer(
            { roomId, playerId: kickedUserId },
            {
              onSuccess: () => {
                showSuccess(t('roomDetail.kickSuccess'), t('roomDetail.kickSuccessDesc'));
                void refetch();
              },
              onError: (error: unknown) => {
                const err = error as { message?: string; code?: string };
                showDanger(
                  t('roomDetail.notifications.error'),
                  getTranslatedError(err?.message, err?.code) || t('roomDetail.kickError'),
                  () => {},
                );
              },
            },
          );
        },
        undefined,
        t('roomDetail.kickButton'),
        t('common.buttons.cancel'),
      );
    },
    [roomActionsBlocked, showDanger, t, kickPlayer, roomId, showSuccess, refetch],
  );

  const handleLeaveRoom = useCallback(() => {
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
          onError: (error: unknown) => {
            const err = error as { message?: string; code?: string };
            toast.error(
              t('common.error', 'Lỗi'),
              getTranslatedError(err?.message, err?.code) ||
                t('roomDetail.leaveRoomError', 'Không thể rời phòng'),
            );
          },
        });
      },
      undefined,
      t('roomDetail.leaveRoomConfirm'),
      t('common.buttons.cancel'),
    );
  }, [roomActionsBlocked, showConfirm, t, leaveMatchRoom, roomId, toast, handleGoBack]);

  const handleNavigateToFeedbackIntro = useCallback(async () => {
    if (!displayRoom || !userId) return;
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
    const me = allParticipants.find((p) => p.userId === userId);
    const myTeam =
      me?.teamAssignment === 'A' || me?.teamAssignment === 'B' ? me.teamAssignment : 'A';

    const teamAName =
      displayRoom.formations?.teamA?.teamName ||
      displayRoom.teamNames?.A ||
      t('roomDetail.teamA', 'Đội A');
    const teamBName =
      displayRoom.formations?.teamB?.teamName ||
      displayRoom.teamNames?.B ||
      t('roomDetail.teamB', 'Đội B');

    const formationAssignments =
      myTeam === 'A'
        ? (displayRoom.formations?.teamA?.assignments ?? [])
        : (displayRoom.formations?.teamB?.assignments ?? []);

    const teamPool =
      myTeam === 'A' ? displayRoom.participants.teamA : displayRoom.participants.teamB;
    const teammates = teamPool
      .filter((p) => p.userId !== userId)
      .map((p) => {
        const formationSlot = formationAssignments.find((a) => a.playerId === p.userId);
        return {
          userId: p.userId,
          fullName: p.fullName,
          avatarUrl: p.avatarUrl,
          position: formationSlot?.position ?? p.position,
          teamAssignment: p.teamAssignment as 'A' | 'B',
        };
      });

    const opponentPool =
      myTeam === 'A' ? displayRoom.participants.teamB : displayRoom.participants.teamA;
    const opponentFormationAssignments =
      myTeam === 'A'
        ? (displayRoom.formations?.teamB?.assignments ?? [])
        : (displayRoom.formations?.teamA?.assignments ?? []);
    const opponents = opponentPool.map((p) => {
      const formationSlot = opponentFormationAssignments.find((a) => a.playerId === p.userId);
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
        photoUrls: (venuePhotosToShow ?? []).map((p) => p.photoUrl).filter(Boolean) as string[],
      },
      matchDate: displayRoom.matchDate,
      startTime: displayRoom.startTime,
      myTeam,
      teammates,
      opponents,
    });
    navigation?.navigate('FeedbackIntro', { roomId: displayRoom.roomId });
  }, [
    displayRoom,
    userId,
    roomActionsBlocked,
    feedbackSession,
    navigation,
    t,
    startSession,
    isHost,
    venuePhotosToShow,
  ]);

  const handleNavigateToEloBreakdown = useCallback(() => {
    if (roomActionsBlocked) return;
    navigation?.navigate('EloBreakdown', {
      matchId: displayRoom?.roomId,
      matchLabel:
        displayRoom?.roomName ||
        `${displayRoom?.teamNames?.A ?? t('roomDetail.teamA', 'Team A')} vs ${displayRoom?.teamNames?.B ?? t('roomDetail.teamB', 'Team B')}`,
    });
  }, [roomActionsBlocked, navigation, displayRoom, t]);

  const handleSubmitAiQuery = useCallback(async () => {
    const trimmedQuery = aiQuery.trim();
    if (!displayRoom || !trimmedQuery || aiPlayerSuggestLockRef.current) return;

    aiPlayerSuggestLockRef.current = true;
    setIsSuggestingPlayers(true);
    setAiPlayerSuggestError(null);
    setAiThinkingText(null);
    setAiPlayerRecommendations([]);

    try {
      const thinking = await getAIThinkingText(trimmedQuery, 'player').catch(() => '');
      setAiThinkingText(thinking);
      await delay(5000);

      const response = await suggestPlayers({
        query: trimmedQuery,
        roomId: displayRoom.roomId,
        page: 1,
        pageSize: 10,
      });

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
    } catch (error: unknown) {
      const err = error as { details?: { detail?: string }; code?: string };
      setAiPlayerSuggestError(
        getTranslatedError(err?.details?.detail, err?.code) || t('aiRecommendation.searching'),
      );
      setAiPlayerRecommendations([]);
    } finally {
      aiPlayerSuggestLockRef.current = false;
      setIsSuggestingPlayers(false);
    }
  }, [aiQuery, displayRoom, suggestPlayers, t]);

  const closeAiModal = useCallback(() => {
    setAiQuery('');
    setAiPlayerSuggestError(null);
    setAiThinkingText(null);
    setAiPlayerRecommendations([]);
    setAiModalVisible(false);
  }, []);

  const onAiQueryChange = useCallback((value: string) => {
    setAiPlayerSuggestError(null);
    setAiThinkingText(null);
    setAiQuery(value);
  }, []);

  return {
    transferRequest,
    setTransferRequest,
    transferHostVisible,
    setTransferHostVisible,
    isAcceptingTransfer,
    autoCloseSeconds,
    setAutoCloseSeconds,
    autoCloseTickAt,
    handleAutoCloseCountdownTick,
    handleAcceptTransfer,
    handleRejectTransfer,
    handleRefresh,
    isRefreshing,
    showPositionModal,
    pendingTeamAssignment,
    handleOpenPositionModal,
    handlePositionSelected,
    handleClosePositionModal,
    handleJoinMatch,
    handleKickPlayer,
    handleLeaveRoom,
    handleNavigateToFeedbackIntro,
    handleNavigateToEloBreakdown,
    aiModalVisible,
    setAiModalVisible,
    aiQuery,
    aiPlayerRecommendations,
    aiPlayerSuggestError,
    aiThinkingText,
    isSuggestingPlayers,
    handleSubmitAiQuery,
    closeAiModal,
    onAiQueryChange,
  };
}
