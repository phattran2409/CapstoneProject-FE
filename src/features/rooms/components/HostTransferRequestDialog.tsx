import React from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { useTranslation } from 'react-i18next';

export interface HostTransferRequestPayload {
  roomId: string;
  hostName: string;
  targetUserId: string;
  requestedAt: string;
}

interface HostTransferRequestDialogProps {
  visible: boolean;
  request: HostTransferRequestPayload | null;
  isAccepting: boolean;
  onAccept: () => void;
  onReject: () => void;
}

const HostTransferRequestDialog: React.FC<HostTransferRequestDialogProps> = ({
  visible,
  request,
  isAccepting,
  onAccept,
  onReject,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!request) return null;

  const primaryColor = theme.colors.neonGreen ?? theme.colors.primary;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onReject}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.dialog,
            {
              backgroundColor: theme.colors.background,
              borderColor: theme.colors.border,
            },
          ]}
        >
          {/* Icon */}
          <View style={[styles.iconWrap, { backgroundColor: theme.colors.surface }]}>
            <Ionicons name="swap-vertical" size={32} color={primaryColor} />
          </View>

          {/* Title */}
          <ThemedText size="xl" weight="bold" style={styles.title}>
            {t('roomDetail.transferRequestTitle', 'Yêu cầu chuyển host')}
          </ThemedText>

          {/* Message */}
          <ThemedText variant="secondary" size="m" style={styles.message}>
            {t(
              'roomDetail.transferRequestMessage',
              '{{hostName}} muốn chuyển quyền host cho bạn. Bạn có đồng ý nhận không?',
              { hostName: request.hostName },
            )}
          </ThemedText>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, styles.btnGhost, { borderColor: theme.colors.border }]}
              onPress={onReject}
              disabled={isAccepting}
            >
              <ThemedText size="m" weight="semiBold" variant="secondary">
                {t('roomDetail.rejectTransfer', 'Từ chối')}
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btn,
                styles.btnPrimary,
                {
                  backgroundColor: primaryColor,
                  opacity: isAccepting ? 0.7 : 1,
                },
              ]}
              onPress={onAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <ThemedText size="m" weight="bold" style={{ color: '#000' }}>
                  {t('roomDetail.acceptTransfer', 'Chấp nhận')}
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnGhost: {
    borderWidth: 1,
  },
  btnPrimary: {},
});

export { HostTransferRequestDialog };
