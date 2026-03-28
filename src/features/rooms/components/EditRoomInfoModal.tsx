import React, { useEffect } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { useUpdateRoomInfo } from '../hooks/useUpdateRoomInfo';
import { useToast } from '@/shared/toast';
import { getTranslatedError } from '@/shared/utils/errorTranslations';

interface EditRoomInfoModalProps {
  visible: boolean;
  onClose: () => void;
  roomId: string;
  initialValues: {
    roomName: string;
    description?: string;
    rules?: string;
  };
}

const buildSchema = (t: (key: string) => string) =>
  z.object({
    roomName: z
      .string()
      .min(1, t('roomDetail.editRoomInfoValidation.roomNameRequired'))
      .max(100, t('roomDetail.editRoomInfoValidation.roomNameTooLong')),
    description: z
      .string()
      .max(500, t('roomDetail.editRoomInfoValidation.descriptionTooLong'))
      .optional()
      .or(z.literal('')),
    rules: z
      .string()
      .max(1000, t('roomDetail.editRoomInfoValidation.rulesTooLong'))
      .optional()
      .or(z.literal('')),
  });

type FormData = {
  roomName: string;
  description?: string;
  rules?: string;
};

const EditRoomInfoModal: React.FC<EditRoomInfoModalProps> = ({
  visible,
  onClose,
  roomId,
  initialValues,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const toast = useToast();
  const { mutate: updateRoomInfo, isPending } = useUpdateRoomInfo();

  const schema = buildSchema(t);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      roomName: initialValues.roomName,
      description: initialValues.description ?? '',
      rules: initialValues.rules ?? '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({
        roomName: initialValues.roomName,
        description: initialValues.description ?? '',
        rules: initialValues.rules ?? '',
      });
    }
  }, [visible, initialValues, reset]);

  const onSubmit = (data: FormData) => {
    updateRoomInfo(
      {
        roomId,
        roomName: data.roomName,
        description: data.description || undefined,
        rules: data.rules || undefined,
      },
      {
        onSuccess: () => {
          toast.success(
            t('roomDetail.editRoomInfoSuccess'),
            t('roomDetail.editRoomInfoSuccessDesc'),
          );
          onClose();
        },
        onError: (err: any) => {
          toast.error(
            t('common.error'),
            getTranslatedError(err?.message) || t('roomDetail.editRoomInfoError'),
          );
        },
      },
    );
  };

  const primaryColor = theme.colors.neonGreen ?? theme.colors.primary;
  const inputBg = theme.colors.surface;
  const borderColor = theme.colors.border;
  const textColor = theme.colors.text;
  const errorColor = theme.colors.error ?? '#ef4444';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <TouchableOpacity
          style={[styles.overlay, { backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)' }]}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <ThemedText size="l" weight="bold">
              {t('roomDetail.editRoomInfoTitle')}
            </ThemedText>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.formContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Room Name */}
            <View style={styles.fieldGroup}>
              <ThemedText size="s" weight="bold" variant="secondary" style={styles.label}>
                {t('roomDetail.editRoomInfoRoomName')}
                <ThemedText size="s" style={{ color: errorColor }}> *</ThemedText>
              </ThemedText>
              <Controller
                control={control}
                name="roomName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: inputBg,
                        borderColor: errors.roomName ? errorColor : borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholder={t('roomDetail.editRoomInfoRoomNamePlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    maxLength={100}
                  />
                )}
              />
              {errors.roomName && (
                <ThemedText size="xs" style={[styles.errorText, { color: errorColor }]}>
                  {errors.roomName.message}
                </ThemedText>
              )}
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <ThemedText size="s" weight="semiBold" variant="secondary" style={styles.label}>
                {t('roomDetail.editRoomInfoDescription')}
              </ThemedText>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                      {
                        backgroundColor: inputBg,
                        borderColor: errors.description ? errorColor : borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholder={t('roomDetail.editRoomInfoDescriptionPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={3}
                    maxLength={500}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.description && (
                <ThemedText size="xs" style={[styles.errorText, { color: errorColor }]}>
                  {errors.description.message}
                </ThemedText>
              )}
            </View>

            {/* Rules */}
            <View style={styles.fieldGroup}>
              <ThemedText size="s" weight="semiBold" variant="secondary" style={styles.label}>
                {t('roomDetail.editRoomInfoRules')}
              </ThemedText>
              <Controller
                control={control}
                name="rules"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.input,
                      styles.multilineInput,
                      {
                        backgroundColor: inputBg,
                        borderColor: errors.rules ? errorColor : borderColor,
                        color: textColor,
                      },
                    ]}
                    placeholder={t('roomDetail.editRoomInfoRulesPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={4}
                    maxLength={1000}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.rules && (
                <ThemedText size="xs" style={[styles.errorText, { color: errorColor }]}>
                  {errors.rules.message}
                </ThemedText>
              )}
            </View>
          </ScrollView>

          {/* Save Button */}
          <View style={[styles.footer, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: primaryColor }, isPending && styles.saveButtonDisabled]}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : null}
              <ThemedText size="m" weight="bold" style={styles.saveButtonText}>
                {isPending ? t('roomDetail.editRoomInfoSaving') : t('roomDetail.editRoomInfoSave')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 90,
    paddingTop: 12,
  },
  errorText: {
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#000',
  },
});

export { EditRoomInfoModal };
