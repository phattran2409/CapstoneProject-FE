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
import { useToast } from '@/shared/toast';
import { useTranslation } from 'react-i18next';
import { useInviteFriend } from '../hooks/useInviteFriend';
import { getTranslatedError } from '@/shared/utils/errorTranslations';
interface InviteFriendsModalProps {
  visible: boolean;
  roomId: string;
  shareMessage: string;
  onClose: () => void;
  title?: string;
  inviteToRoom?: boolean;
}

const InviteFriendsModal: React.FC<InviteFriendsModalProps> = ({
  visible,
  roomId,
  shareMessage,
  onClose,
  title,
  inviteToRoom = false,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const toast = useToast();
  const [sendingFriendId, setSendingFriendId] = useState<string | null>(null);

  const {
    friends,
    loading: friendsLoading,
  } = usePaginatedFriends({
    pageSize: 20,
    enabled: visible,
  });

  const { mutateAsync: sendChatMessage, isPending: isSendingMessage } = useSendChatMessage();
  const { mutateAsync: inviteFriendToRoom, isPending: isInvitingFriend } = useInviteFriend();

  const handleSendToFriend = async (receiverId: string) => {
    if (!user?.userId) return;
    const inviteMessage = `${shareMessage}\n\n[ROOM_ID:${roomId}]`;
    setSendingFriendId(receiverId);
    try {
      if (inviteToRoom) {
        await inviteFriendToRoom({
          roomId,
          friendUserId: receiverId,
        });
      }
      await sendChatMessage({
        senderId: user.userId,
        receiverId,
        messageText: inviteMessage,
        messageType: 'Text',
      });

      toast.success(
        inviteToRoom ? t('roomDetail.inviteFriendSuccess') : t('roomDetail.shareSuccess')
      );
      onClose();
    } catch (error: any) {
      toast.error(
        t('roomDetail.notifications.error'),
        getTranslatedError(error?.message, error?.code) ||
          t('roomDetail.inviteFriendError')
      );
    } finally {
      setSendingFriendId(null);
    }
  };

  const primaryColor = theme.colors.neonGreen ?? theme.colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.inviteOverlay,
          { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            styles.inviteBox,
            { backgroundColor: theme.colors.background },
          ]}
        >
          <View
            style={[
              styles.inviteHeader,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <ThemedText size="xl" weight="bold">
              {title ?? t('roomDetail.inviteModalTitle')}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.inviteClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {friendsLoading ? (
            <View style={styles.inviteLoading}>
              <ActivityIndicator size="large" color={primaryColor} />
            </View>
          ) : (
            <ScrollView
              style={styles.inviteList}
              contentContainerStyle={styles.inviteListContent}
            >
              {friends.length === 0 ? (
                <ThemedText
                  variant="secondary"
                  size="m"
                  style={styles.inviteEmpty}
                >
                  {t('roomDetail.inviteNoFriends')}
                </ThemedText>
              ) : (
                friends.map((friend) => (
                  <View
                    key={friend.userId}
                    style={[
                      styles.inviteRow,
                      { borderBottomColor: theme.colors.border },
                    ]}
                  >
                    <Image
                      source={
                        friend.avatarUrl
                          ? { uri: friend.avatarUrl }
                          : require("../../../assets/images/default_avatar.png")
                      }
                      style={styles.inviteAvatar}
                    />
                    <ThemedText
                      size="m"
                      weight="medium"
                      style={styles.inviteName}
                      numberOfLines={1}
                    >
                      {friend.fullName}
                    </ThemedText>
                    <TouchableOpacity
                      style={[
                        styles.inviteSendBtn,
                        { backgroundColor: primaryColor },
                      ]}
                      onPress={() => handleSendToFriend(friend.userId)}
                      disabled={isSendingMessage || isInvitingFriend}
                    >
                      {sendingFriendId === friend.userId && (isSendingMessage || isInvitingFriend) ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <ThemedText
                          size="s"
                          weight="bold"
                          style={{ color: '#000' }}
                        >
                          {t('roomDetail.inviteSend')}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
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

export { InviteFriendsModal };

