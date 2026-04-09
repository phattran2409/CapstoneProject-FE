import React, { useMemo } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useTransferHost } from '../hooks/useTransferHost';
import type { MatchRoomParticipant } from '../types/room.types';

interface TransferHostModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  participants: MatchRoomParticipant[];
  currentUserId: string;
}

const TransferHostModal: React.FC<TransferHostModalProps> = ({
  visible,
  onClose,
  roomId,
  participants,
  currentUserId,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { mutate: transferHost, isPending, variables } = useTransferHost();

  const transferableParticipants = useMemo(
    () => participants.filter((p) => p.userId !== currentUserId),
    [participants, currentUserId],
  );

  const handleTransfer = (targetUserId: string) => {
    transferHost(
      { roomId, targetUserId },
      {
        onSuccess: () => onClose(),
      },
    );
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
          styles.overlay,
          { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)' },
        ]}
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: theme.colors.border },
            ]}
          >
            <ThemedText size="xl" weight="bold">
              {t('roomDetail.transferHost', 'Chuyển quyền host')}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Participant list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
          >
            {transferableParticipants.length === 0 ? (
              <ThemedText
                variant="secondary"
                size="m"
                style={styles.emptyText}
              >
                {t('roomDetail.noParticipantsToTransfer', 'Không có người chơi để chuyển quyền')}
              </ThemedText>
            ) : (
              transferableParticipants.map((participant) => {
                const isTransferring =
                  isPending && variables?.targetUserId === participant.userId;

                return (
                  <View
                    key={participant.userId}
                    style={[
                      styles.row,
                      { borderBottomColor: theme.colors.border },
                    ]}
                  >
                    <Image
                      source={
                        participant.avatarUrl
                          ? { uri: participant.avatarUrl }
                          : require('../../../assets/images/default_avatar.png')
                      }
                      style={styles.avatar}
                    />
                    <View style={styles.info}>
                      <ThemedText size="m" weight="medium" numberOfLines={1}>
                        {participant.fullName}
                      </ThemedText>
                      <ThemedText variant="secondary" size="s">
                        {participant.position} — {t(`roomDetail.team`, 'Đội')}{' '}
                        {participant.teamAssignment === 'Unassigned'
                          ? t('roomDetail.unassigned', 'Chưa chọn')
                          : participant.teamAssignment}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.transferBtn,
                        {
                          backgroundColor: primaryColor,
                          opacity: isPending ? 0.6 : 1,
                        },
                      ]}
                      onPress={() => handleTransfer(participant.userId)}
                      disabled={isPending}
                    >
                      {isTransferring ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <ThemedText size="s" weight="bold" style={{ color: '#000' }}>
                          {t('roomDetail.transfer', 'Chuyển')}
                        </ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    maxHeight: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 4,
  },
  list: {
    maxHeight: 400,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyText: {
    padding: 24,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  transferBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
});

export { TransferHostModal };
