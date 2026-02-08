/**
 * Modal nhập mật khẩu khi vào phòng private
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@/shared/theme';
import { ThemedText, ThemedView, ThemedIcon } from '@/shared/components/themed';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface PrivateRoomPasswordModalProps {
  visible: boolean;
  roomName?: string;
  /** Tùy chỉnh tiêu đề (mặc định: "Phòng riêng tư") */
  title?: string;
  /** Tùy chỉnh mô tả (mặc định: roomName hoặc "Nhập mật khẩu để vào phòng") */
  subtitle?: string;
  onConfirm: (password: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  errorMessage?: string;
}

const PrivateRoomPasswordModal: React.FC<PrivateRoomPasswordModalProps> = ({
  visible,
  roomName,
  title: titleProp,
  subtitle: subtitleProp,
  onConfirm,
  onCancel,
  isLoading = false,
  errorMessage,
}) => {
  const title = titleProp ?? 'Phòng riêng tư';
  const subtitle = subtitleProp ?? (roomName ? roomName : 'Nhập mật khẩu để vào phòng');
  const { theme } = useTheme();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!visible) {
      setPassword('');
      setShowPassword(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    const trimmed = password.trim();
    if (!trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.keyboardView}
            >
              <ThemedView
                style={[
                  styles.modalBox,
                  {
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.border,
                    borderRadius: theme.radius.l,
                  },
                ]}
              >
                <View style={styles.header}>
                  <View style={[styles.iconWrap, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="lock-closed" size={28} color={theme.colors.neonGreen} />
                  </View>
                  <ThemedText size="xl" weight="bold" style={styles.title}>
                    {title}
                  </ThemedText>
                  <ThemedText variant="secondary" size="m" style={styles.subtitle} numberOfLines={2}>
                    {subtitle}
                  </ThemedText>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        color: theme.colors.text,
                        backgroundColor: theme.colors.surface,
                        borderColor: errorMessage ? theme.colors.error : theme.colors.border,
                      },
                    ]}
                    placeholder="Mật khẩu phòng"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity
                    style={[styles.eyeButton, { backgroundColor: theme.colors.surface }]}
                    onPress={() => setShowPassword((v) => !v)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={theme.colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                {errorMessage ? (
                  <ThemedText size="s" style={[styles.errorText, { color: theme.colors.error }]}>
                    {errorMessage}
                  </ThemedText>
                ) : null}

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.btn, styles.btnCancel, { borderColor: theme.colors.border }]}
                    onPress={onCancel}
                    disabled={isLoading}
                  >
                    <ThemedText size="m" weight="semiBold" variant="secondary">
                      Hủy
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      styles.btnConfirm,
                      {
                        backgroundColor: theme.colors.neonGreen,
                        opacity: isLoading || !password.trim() ? 0.6 : 1,
                      },
                    ]}
                    onPress={handleConfirm}
                    disabled={isLoading || !password.trim()}
                  >
                    <ThemedText size="m" weight="bold" style={{ color: '#000' }}>
                      {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
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
  keyboardView: {
    width: '100%',
    maxWidth: 360,
  },
  modalBox: {
    width: '100%',
    borderWidth: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginBottom: 12,
    marginLeft: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    borderWidth: 1,
  },
  btnConfirm: {},
});

export default PrivateRoomPasswordModal;
