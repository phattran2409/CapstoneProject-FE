import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { useTranslation } from 'react-i18next';
import PrivateRoomPasswordModal from './PrivateRoomPasswordModal';
import { useUpdateRoomPrivacy } from '../hooks/useUpdateRoomPrivacy';
import { EditRoomInfoModal } from './EditRoomInfoModal';
import { useToast } from '@/shared/toast';
import { useCancelRoom } from '../hooks/useCancelRoom';
import { getTranslatedError } from '@/shared/utils/errorTranslations';

export type RoomMenuVariant = 'host' | 'player';

interface HostMenuModalProps {
  /** Host: quản lý phòng. Player (không phải host): mời bạn bè & rời phòng */
  variant?: RoomMenuVariant;
  room: {
    roomId: string;
    roomName: string;
    format: string;
    datetime: string;
    venueName: string;
    description?: string;
    rules?: string;
  };
  visible: boolean;
  handleShowMenuModal: () => void;
  /** Chỉ dùng khi variant === 'player' */
  onInviteFriends?: () => void;
  onLeaveRoom?: () => void;
  isLeavingRoom?: boolean;
  /** Mở modal chuyển quyền host (chỉ host) */
  onTransferHost?: () => void;
}

const HostMenuModal: React.FC<HostMenuModalProps> = ({
  variant = 'host',
  room,
  visible,
  handleShowMenuModal,
  onInviteFriends,
  onLeaveRoom,
  isLeavingRoom = false,
  onTransferHost,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const toast = useToast();
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | undefined>(undefined);
  const [editRoomInfoVisible, setEditRoomInfoVisible] = useState(false);
  const [cancelReasonVisible, setCancelReasonVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelReasonError, setCancelReasonError] = useState<string | undefined>(undefined);

  const { mutate: updateRoomPrivacy, isPending: isUpdatingPrivacy } = useUpdateRoomPrivacy();
  const { mutate: cancelRoom, isPending: isCancellingRoom } = useCancelRoom();

  useEffect(() => {
    if (!cancelReasonVisible) {
      setCancelReason('');
      setCancelReasonError(undefined);
    }
  }, [cancelReasonVisible]);

  const handleSetPrivateRoom = () => {
    handleShowMenuModal();
    setPrivacyError(undefined);
    setPrivacyModalVisible(true);
  };

  const handleEditRoomInfo = () => {
    handleShowMenuModal();
    setEditRoomInfoVisible(true);
  };

  const handleOpenCancelRoom = () => {
    handleShowMenuModal();
    setCancelReasonVisible(true);
  };

  const handlePrivacyConfirm = (password: string) => {
    setPrivacyError(undefined);
    updateRoomPrivacy(
      {
        roomId: room.roomId,
        visibility: 'Private',
        password,
      },
      {
        onSuccess: () => {
          setPrivacyModalVisible(false);
        },
        onError: (err: any) => {
          setPrivacyError(err?.message ?? t('roomDetail.editRoomInfoError'));
        },
      }
    );
  };

  const handleConfirmCancelRoom = () => {
    const trimmed = cancelReason.trim();
    if (!trimmed) {
      setCancelReasonError(t('roomDetail.cancelReasonRequired'));
      return;
    }
    setCancelReasonError(undefined);
    cancelRoom(
      { roomId: room.roomId, reason: trimmed },
      {
        onSuccess: () => {
          setCancelReasonVisible(false);
          toast.success(t('roomDetail.cancelSuccess'), t('roomDetail.cancelSuccessDesc'));
          navigation.goBack();
        },
        onError: (error: any) => {
          toast.error(
            t('roomDetail.notifications.error'),
            getTranslatedError(error?.message, error?.code) || t('roomDetail.cancelError')
          );
        },
      }
    );
  };

  const primaryColor = theme.colors.neonGreen ?? theme.colors.primary;
  const dangerColor = theme.colors.error;

  const handlePlayerInvite = () => {
    handleShowMenuModal();
    onInviteFriends?.();
  };

  const handleTransferHost = () => {
    handleShowMenuModal();
    onTransferHost?.();
  };

  const handlePlayerLeave = () => {
    console.log('handlePlayerLeave');
    handleShowMenuModal();
    onLeaveRoom?.();
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleShowMenuModal}
      >
        <TouchableOpacity
          style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPress={handleShowMenuModal}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={[
              styles.menuModal,
              {
                backgroundColor: theme.colors.surface,
                borderColor: primaryColor,
                borderTopWidth: 4,
              },
            ]}
          >
            {variant === 'host' ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handleEditRoomInfo}>
                  <Ionicons name="create-outline" size={24} color={primaryColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {t('roomDetail.editRoomInfo')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleSetPrivateRoom}>
                  <Ionicons name="lock-closed-outline" size={24} color={primaryColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {t('roomDetail.setPrivateRoom')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handlePlayerInvite}>
                  <Ionicons name="people-outline" size={24} color={primaryColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {t('roomDetail.menuInviteFriends')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuItem} onPress={handleTransferHost}>
                  <Ionicons name='swap-vertical-outline' size={24} color={primaryColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {t('roomDetail.menuTransferHost', 'Chuyển quyền host')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePlayerLeave}
                  disabled={isLeavingRoom}
                >
                  <Ionicons name="exit-outline" size={24} color={dangerColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: dangerColor }]}>
                    {t('roomDetail.leaveRoomTitle')}
                  </ThemedText>
                </TouchableOpacity>
                <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
                <TouchableOpacity style={styles.menuItem} onPress={handleOpenCancelRoom}>
                  <Ionicons name="close-circle" size={26} color={dangerColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: dangerColor }]}>
                    {t('roomDetail.hostMenuCancelRoom')}
                  </ThemedText>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={handlePlayerInvite}>
                  <Ionicons name="people-outline" size={24} color={primaryColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                    {t('roomDetail.menuInviteFriends')}
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePlayerLeave}
                  disabled={isLeavingRoom}
                >
                  <Ionicons name="exit-outline" size={24} color={dangerColor} />
                  <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: dangerColor }]}>
                    {t('roomDetail.leaveRoomTitle')}
                  </ThemedText>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.menuCancelButton} onPress={handleShowMenuModal}>
              <ThemedText size="m" weight="medium" variant="secondary">
                {t('roomDetail.hostMenuClose')}
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={cancelReasonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !isCancellingRoom && setCancelReasonVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => !isCancellingRoom && setCancelReasonVisible(false)}>
          <View style={styles.reasonOverlay}>
            <TouchableWithoutFeedback>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.reasonKeyboard}
              >
                <View
                  style={[
                    styles.reasonBox,
                    {
                      backgroundColor: theme.colors.background,
                      borderColor: theme.colors.border,
                    },
                  ]}
                >
                  <View style={styles.reasonHeader}>
                    <View style={[styles.reasonIconWrap, { backgroundColor: theme.colors.surface }]}>
                      <Ionicons name="close-circle" size={32} color={dangerColor} />
                    </View>
                    <ThemedText size="xl" weight="bold" style={styles.reasonTitle}>
                      {t('roomDetail.cancelReasonModalTitle')}
                    </ThemedText>
                    <ThemedText variant="secondary" size="m" style={styles.reasonSubtitle}>
                      {t('roomDetail.cancelReasonModalSubtitle')}
                    </ThemedText>
                  </View>

                  <TextInput
                    style={[
                      styles.reasonInput,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surface,
                        borderColor: cancelReasonError ? dangerColor : theme.colors.border,
                      },
                    ]}
                    placeholder={t('roomDetail.cancelReasonPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={cancelReason}
                    onChangeText={(text) => {
                      setCancelReason(text);
                      if (cancelReasonError) setCancelReasonError(undefined);
                    }}
                    multiline
                    maxLength={500}
                    editable={!isCancellingRoom}
                    textAlignVertical="top"
                  />

                  {cancelReasonError ? (
                    <ThemedText size="s" style={[styles.reasonError, { color: dangerColor }]}>
                      {cancelReasonError}
                    </ThemedText>
                  ) : null}

                  <View style={styles.reasonActions}>
                    <TouchableOpacity
                      style={[styles.reasonBtn, styles.reasonBtnGhost, { borderColor: theme.colors.border }]}
                      onPress={() => setCancelReasonVisible(false)}
                      disabled={isCancellingRoom}
                    >
                      <ThemedText size="m" weight="semiBold" variant="secondary">
                        {t('roomDetail.cancelReasonBack')}
                      </ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.reasonBtn,
                        styles.reasonBtnDanger,
                        {
                          backgroundColor: dangerColor,
                          opacity: isCancellingRoom ? 0.7 : 1,
                        },
                      ]}
                      onPress={handleConfirmCancelRoom}
                      disabled={isCancellingRoom}
                    >
                      {isCancellingRoom ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <ThemedText size="m" weight="bold" style={{ color: '#fff' }}>
                          {t('common.buttons.confirm')}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <PrivateRoomPasswordModal
        visible={privacyModalVisible}
        roomName={room.roomName}
        title={t('roomDetail.setPrivateRoom')}
        subtitle={t('roomDetail.setPrivateRoomSubtitle')}
        passwordPlaceholder={t('roomDetail.privateRoomPasswordPlaceholder')}
        cancelButtonLabel={t('common.buttons.cancel')}
        confirmButtonLabel={t('common.buttons.confirm')}
        loadingLabel={t('common.buttons.processing')}
        onConfirm={handlePrivacyConfirm}
        onCancel={() => {
          setPrivacyModalVisible(false);
          setPrivacyError(undefined);
        }}
        isLoading={isUpdatingPrivacy}
        errorMessage={privacyError}
      />

      <EditRoomInfoModal
        visible={editRoomInfoVisible}
        onClose={() => setEditRoomInfoVisible(false)}
        roomId={room.roomId}
        initialValues={{
          roomName: room.roomName,
          description: room.description,
          rules: room.rules,
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModal: {
    width: '85%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  menuCancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  reasonOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  reasonKeyboard: {
    width: '100%',
    maxWidth: 400,
  },
  reasonBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  reasonHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  reasonIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  reasonTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  reasonSubtitle: {
    textAlign: 'center',
  },
  reasonInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
  },
  reasonError: {
    marginTop: 8,
  },
  reasonActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  reasonBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  reasonBtnGhost: {
    borderWidth: 1,
  },
  reasonBtnDanger: {},
});

export { HostMenuModal };
