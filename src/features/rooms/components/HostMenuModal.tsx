import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { useAuthStore } from '@/features/auth';
import { ShareRoom } from './ShareRoom';
import PrivateRoomPasswordModal from './PrivateRoomPasswordModal';
import { useUpdateRoomPrivacy } from '../hooks/useUpdateRoomPrivacy';
import { InviteFriendsModal } from './InviteFriendsModal';

interface HostMenuModalProps {
  room: {
    roomId: string;
    roomName: string;
    format: string;
    datetime: string;
    venueName: string;
  };
  visible: boolean;
  handleShowMenuModal: () => void;
  handleCancelRoom: () => void;
  isCancelling: boolean;
}

const HostMenuModal: React.FC<HostMenuModalProps> = ({
  room,
  visible,
  handleShowMenuModal,
  handleCancelRoom,
  isCancelling,
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const [shareRoomVisible, setShareRoomVisible] = useState(false);
  const [inviteFriendsVisible, setInviteFriendsVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [privacyError, setPrivacyError] = useState<string | undefined>(undefined);
  const { mutate: updateRoomPrivacy, isPending: isUpdatingPrivacy } = useUpdateRoomPrivacy();

  const shareUrl = `kickify://room/${room.roomId}`;
  const shareMessage = `Join my football match!\n\nFormat: ${room?.format}\nDate: ${new Date(room?.datetime || '').toLocaleString('vi-VN')}\nVenue: ${room?.venueName || 'TBA'}\n\nJoin here: ${shareUrl}`;

  const handleShareRoom = () => {
    handleShowMenuModal();
    setShareRoomVisible(true);
  };

  const handleInviteFriends = () => {
    handleShowMenuModal();
    setInviteFriendsVisible(true);
  };

  const handleSetPrivateRoom = () => {
    handleShowMenuModal();
    setPrivacyError(undefined);
    setPrivacyModalVisible(true);
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
          setPrivacyError(err?.message ?? 'Không thể cập nhật. Thử lại.');
        },
      }
    );
  };

  const primaryColor = theme.colors.neonGreen ?? theme.colors.primary;

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
            <TouchableOpacity style={styles.menuItem} onPress={handleShareRoom}>
              <Ionicons name="share-outline" size={24} color={primaryColor} />
              <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                Share Room
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleInviteFriends}>
              <Ionicons name="people-outline" size={24} color={primaryColor} />
              <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                Mời bạn bè
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleSetPrivateRoom}>
              <Ionicons name="lock-closed-outline" size={24} color={primaryColor} />
              <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                Chuyển thành phòng riêng tư
              </ThemedText>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                handleShowMenuModal();
                handleCancelRoom();
              }}
              disabled={isCancelling}
            >
              <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
              <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.error }]}>
                {isCancelling ? 'Đang hủy...' : 'Hủy phòng'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuCancelButton} onPress={handleShowMenuModal}>
              <ThemedText size="m" weight="medium" variant="secondary">
                Đóng
              </ThemedText>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ShareRoom
        visible={shareRoomVisible}
        shareUrl={shareUrl}
        shareMessage={shareMessage}
        handleClose={() => setShareRoomVisible(false)}
      />

      {/* Modal mời bạn bè - gửi nội dung phòng qua chat */}
      <InviteFriendsModal
        visible={inviteFriendsVisible}
        shareMessage={shareMessage}
        onClose={() => setInviteFriendsVisible(false)}
      />

      <PrivateRoomPasswordModal
        visible={privacyModalVisible}
        roomName={room.roomName}
        title="Chuyển thành phòng riêng tư"
        subtitle="Nhập mật khẩu để bảo vệ phòng"
        onConfirm={handlePrivacyConfirm}
        onCancel={() => {
          setPrivacyModalVisible(false);
          setPrivacyError(undefined);
        }}
        isLoading={isUpdatingPrivacy}
        errorMessage={privacyError}
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
    height: 1,
    marginVertical: 8,
  },
  menuCancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
});

export { HostMenuModal };
