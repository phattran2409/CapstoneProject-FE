import { Dispatch, SetStateAction, useCallback } from 'react';
import { TFunction } from 'i18next';
import {
  HostTransferRejectedPayload,
  HostTransferredPayload,
  useMatchRoomSignalRHandlers,
} from '@/shared/hooks';
import { MatchRoomFullInfo } from '@/features/rooms';
import type { HostTransferRequestPayload } from '../components/HostTransferRequestDialog';

interface UseRoomInformationSignalRHandlersParams {
  roomId: string;
  currentUserId?: string;
  goBackOrResetToMainTabs: () => void;
  refetch: () => void;
  setRoomData: Dispatch<SetStateAction<MatchRoomFullInfo | null>>;
  setTransferRequest: Dispatch<SetStateAction<HostTransferRequestPayload | null>>;
  showDanger: (title: string, message: string, onConfirm: () => void) => void;
  showInfo: (
    title: string,
    message: string,
    onConfirm: () => void,
    showCloseButton?: boolean,
  ) => void;
  showSuccess: (title: string, message: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
  t: TFunction;
}

export const useRoomInformationSignalRHandlers = ({
  roomId,
  currentUserId,
  goBackOrResetToMainTabs,
  refetch,
  setRoomData,
  setTransferRequest,
  showDanger,
  showInfo,
  showSuccess,
  toast,
  t,
}: UseRoomInformationSignalRHandlersParams) => {
  const showNotification = useCallback(
    (message: string, type?: 'success' | 'info' | 'warning' | 'error') => {
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
    },
    [toast, t],
  );

  const handleKickedFromRoom = useCallback(
    (payload: any) => {
      if (payload.kickedUserId !== currentUserId) return;

      showDanger(
        t('roomDetail.kicked'),
        payload.reason || t('roomDetail.kickedReason'),
        goBackOrResetToMainTabs,
      );
    },
    [currentUserId, showDanger, t, goBackOrResetToMainTabs],
  );

  const handleRoomDeleted = useCallback(() => {
    showInfo(
      t('roomDetail.roomDeleted'),
      t('roomDetail.roomDeletedReason'),
      goBackOrResetToMainTabs,
      false,
    );
  }, [showInfo, t, goBackOrResetToMainTabs]);

  const handleHostChanged = useCallback(
    (newHostId: string) => {
      refetch();

      if (newHostId === currentUserId) {
        showSuccess(t('roomDetail.hostChanged'), t('roomDetail.hostChangedDesc'));
      }
    },
    [currentUserId, refetch, showSuccess, t],
  );

  const handleHostTransferRequested = useCallback((payload: HostTransferRequestPayload) => {
    setTransferRequest(payload);
  }, [setTransferRequest]);

  const handleHostTransferRejected = useCallback(
    (payload: HostTransferRejectedPayload) => {
      setTransferRequest(null);
      toast.error(
        t('roomDetail.transferRejected'),
        t('roomDetail.transferRejectedDesc', { targetUserName: payload.targetUserName }),
      );
    },
    [setTransferRequest, toast, t],
  );

  const handleHostTransferred = useCallback(
    (payload: HostTransferredPayload) => {
      setTransferRequest(null);
      refetch();
      toast.success(
        t('roomDetail.transferAccepted'),
        t('roomDetail.transferAcceptedDesc', { newHostName: payload.newHostName }),
      );
    },
    [setTransferRequest, refetch, toast, t],
  );

  return useMatchRoomSignalRHandlers({
    roomId,
    currentUserId,
    setRoomData,
    showNotification,
    onKicked: handleKickedFromRoom,
    onRoomDeleted: handleRoomDeleted,
    onHostChanged: handleHostChanged,
    onHostTransferRequested: handleHostTransferRequested,
    onHostTransferRejected: handleHostTransferRejected,
    onHostTransferred: handleHostTransferred,
  });
};
