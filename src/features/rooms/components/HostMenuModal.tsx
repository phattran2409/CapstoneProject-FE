import React, { useState } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { usePaginatedFriends } from '@/features/friends/hooks';
import { useSendChatMessage } from '@/features/chat/hooks/useChatMessages';
import { useAuthStore } from '@/features/auth';
import { ShareRoom } from './ShareRoom';
import PrivateRoomPasswordModal from './PrivateRoomPasswordModal';
import { useUpdateRoomPrivacy } from '../hooks/useUpdateRoomPrivacy';

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

  const { friends, loading: friendsLoading, refresh: refreshFriends } = usePaginatedFriends({
    pageSize: 20,
    enabled: inviteFriendsVisible,
  });
  const { mutate: sendChatMessage, isPending: isSendingMessage } = useSendChatMessage();
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
    refreshFriends();
  };

  const handleSendToFriend = (receiverId: string) => {
    if (!user?.userId) return;
    sendChatMessage(
      {
        senderId: user.userId,
        receiverId,
        messageText: shareMessage,
        messageType: 'Text',
      },
      {
        onSuccess: () => {
          setInviteFriendsVisible(false);
        },
        onError: () => {},
      }
    );
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
      <Modal
        visible={inviteFriendsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setInviteFriendsVisible(false)}
      >
        <View style={[styles.inviteOverlay, { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.inviteBox, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.inviteHeader, { borderBottomColor: theme.colors.border }]}>
              <ThemedText size="xl" weight="bold">
                Mời bạn bè vào phòng
              </ThemedText>
              <TouchableOpacity onPress={() => setInviteFriendsVisible(false)} style={styles.inviteClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            {friendsLoading ? (
              <View style={styles.inviteLoading}>
                <ActivityIndicator size="large" color={primaryColor} />
              </View>
            ) : (
              <ScrollView style={styles.inviteList} contentContainerStyle={styles.inviteListContent}>
                {friends.length === 0 ? (
                  <ThemedText variant="secondary" size="m" style={styles.inviteEmpty}>
                    Chưa có bạn bè. Thêm bạn để mời.
                  </ThemedText>
                ) : (
                  friends.map((friend) => (
                    <View
                      key={friend.userId}
                      style={[styles.inviteRow, { borderBottomColor: theme.colors.border }]}
                    >
                      <Image
                        source={{ uri: friend.avatarUrl || undefined }}
                        style={styles.inviteAvatar}
                      />
                      <ThemedText size="m" weight="medium" style={styles.inviteName} numberOfLines={1}>
                        {friend.fullName}
                      </ThemedText>
                      <TouchableOpacity
                        style={[styles.inviteSendBtn, { backgroundColor: primaryColor }]}
                        onPress={() => handleSendToFriend(friend.userId)}
                        disabled={isSendingMessage}
                      >
                        <ThemedText size="s" weight="bold" style={{ color: '#000' }}>
                          Gửi
                        </ThemedText>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  inviteOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  inviteBox: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  inviteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  inviteClose: {
    padding: 4,
  },
  inviteLoading: {
    padding: 40,
    alignItems: 'center',
  },
  inviteList: {
    maxHeight: 400,
  },
  inviteListContent: {
    paddingBottom: 24,
  },
  inviteEmpty: {
    padding: 24,
    textAlign: 'center',
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  inviteAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  inviteName: {
    flex: 1,
  },
  inviteSendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

export { HostMenuModal };
