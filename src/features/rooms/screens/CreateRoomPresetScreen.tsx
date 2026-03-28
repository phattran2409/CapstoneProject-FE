import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import {
  ThemedSafeAreaView,
  ThemedView,
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
} from '@/shared/components/themed';
import { RootStackParamList } from '@/app/navigation/types';
import Alert from '@/shared/components/Alert';
import { useAlert } from '@/shared/hooks/useAlert';
import {
  useMatchRoomCreatePreset,
  useUpsertMatchRoomCreatePreset,
} from '../hooks/useMatchRoomCreatePreset';
import type { MatchRoomCreatePresetDto } from '../types/room.types';
import {
  matchFormatToUi,
  uiToMatchFormat,
  type UiMatchFormat,
} from '../utils/matchRoomCreatePresetMap';

type Nav = NativeStackNavigationProp<RootStackParamList, 'CreateRoomPreset'>;

const DURATION_OPTIONS = [60, 90, 120] as const;
const FORMATS: UiMatchFormat[] = ['5vs5', '7vs7', '11vs11'];

type LocalPreset = {
  matchFormat: UiMatchFormat;
  durationMinutes: 60 | 90 | 120;
  roomName: string;
  description: string;
  isPrivate: boolean;
};

const defaultLocal = (): LocalPreset => ({
  matchFormat: '5vs5',
  durationMinutes: 60,
  roomName: '',
  description: '',
  isPrivate: false,
});

interface Props {
  navigation: Nav;
}

const CreateRoomPresetScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { visible, alertOptions, showInfo, showSuccess, showDanger, hideAlert } = useAlert();
  const { data: serverPreset, isLoading, isError, error } = useMatchRoomCreatePreset();
  const { mutate: upsertPreset, isPending: saving } = useUpsertMatchRoomCreatePreset();
  const [local, setLocal] = useState<LocalPreset>(defaultLocal);

  useEffect(() => {
    if (!serverPreset) return;
    setLocal({
      matchFormat: matchFormatToUi(serverPreset.matchFormat),
      durationMinutes: serverPreset.durationMinutes,
      roomName: serverPreset.roomName,
      description: serverPreset.description ?? '',
      isPrivate: serverPreset.isPrivate,
    });
  }, [serverPreset]);

  const toDto = useCallback((): MatchRoomCreatePresetDto => {
    return {
      matchFormat: uiToMatchFormat(local.matchFormat),
      durationMinutes: local.durationMinutes,
      roomName: local.roomName.trim(),
      description: local.description ?? '',
      isPrivate: local.isPrivate,
    };
  }, [local]);

  const validate = useCallback(() => {
    if (!local.roomName.trim()) {
      showInfo(t('createRoom.title'), t('createRoom.preset.validationName'));
      return false;
    }
    return true;
  }, [local.roomName, showInfo, t]);

  const handleSave = () => {
    if (!validate()) return;
    upsertPreset(toDto(), {
      onSuccess: () => {
        showSuccess(
          t('createRoom.preset.savedTitle'),
          t('createRoom.preset.savedMessage'),
          () => {},
          true,
        );
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : t('createRoom.preset.saveError');
        showDanger(t('common.error'), msg, () => {});
      },
    });
  };

  const handleApply = () => {
    if (!validate()) return;
    upsertPreset(toDto(), {
      onSuccess: () => {
        navigation.navigate({
          name: 'CreateRoom',
          params: { presetApplyNonce: Date.now() },
          merge: true,
        });
      },
      onError: (e: unknown) => {
        const msg = e instanceof Error ? e.message : t('createRoom.preset.saveError');
        showDanger(t('common.error'), msg, () => {});
      },
    });
  };

  const styles = StyleSheet.create({
    safeArea: { paddingVertical: 24 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },
    section: { marginBottom: 20 },
    sectionTitle: { marginBottom: 10, marginTop: 10 },
    formatRow: { flexDirection: 'row', gap: 10 },
    formatBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    durationRow: { flexDirection: 'row', gap: 8 },
    durationBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
    },
    inputWrap: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
    },
    settingsRow: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
    },
    primaryBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    secondaryBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
    },
  });

  if (isLoading) {
    return (
      <ThemedSafeAreaView style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.neonGreen} />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <ThemedView
        style={[styles.header, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ThemedIcon name="arrow-back" size={24} variant="secondary" />
        </TouchableOpacity>
        <ThemedText size="xl" weight="bold" style={{ flex: 1 }}>
          {t('createRoom.preset.title')}
        </ThemedText>
      </ThemedView>

      <ThemedScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isError && (
          <ThemedText variant="muted" size="s" style={{ marginBottom: 12, color: theme.colors.error }}>
            {t('createRoom.preset.loadError')}
            {error instanceof Error ? ` ${error.message}` : ''}
          </ThemedText>
        )}


        <View style={styles.section}>
          <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
            {t('createRoom.selectFormat')}
          </ThemedText>
          <View style={styles.formatRow}>
            {FORMATS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.formatBtn,
                  {
                    backgroundColor:
                      local.matchFormat === f ? theme.colors.neonGreen : theme.colors.surface,
                  },
                ]}
                onPress={() => setLocal((p) => ({ ...p, matchFormat: f }))}
              >
                <ThemedText
                  weight="bold"
                  style={{ color: local.matchFormat === f ? '#000' : theme.colors.textSecondary }}
                >
                  {f}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
            {t('createRoom.duration')}
          </ThemedText>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.durationBtn,
                  {
                    backgroundColor:
                      local.durationMinutes === d ? theme.colors.neonGreen : theme.colors.surface,
                    borderColor:
                      local.durationMinutes === d ? theme.colors.neonGreen : theme.colors.border,
                  },
                ]}
                onPress={() => setLocal((p) => ({ ...p, durationMinutes: d }))}
              >
                <ThemedText
                  weight="semiBold"
                  style={{ color: local.durationMinutes === d ? '#000' : theme.colors.textSecondary }}
                >
                  {d} {t('createRoom.minutes')}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
            {t('createRoom.roomName')}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.inputWrap, { borderColor: theme.colors.border }]}
          >
            <TextInput
              style={{ color: theme.colors.text, fontSize: 16 }}
              placeholder={t('createRoom.roomNamePlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              value={local.roomName}
              onChangeText={(roomName) => setLocal((p) => ({ ...p, roomName }))}
            />
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
            {t('createRoom.description')}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.inputWrap, { borderColor: theme.colors.border }]}
          >
            <TextInput
              style={{ color: theme.colors.text, fontSize: 16 }}
              placeholder={t('createRoom.descriptionPlaceholder')}
              placeholderTextColor={theme.colors.textSecondary}
              value={local.description}
              onChangeText={(description) => setLocal((p) => ({ ...p, description }))}
            />
          </ThemedView>
        </View>

        <View style={styles.section}>
          <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
            {t('createRoom.roomSettings')}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.settingsRow, { borderColor: theme.colors.border }]}
          >
            <ThemedText variant="muted" size="m">
              {t('createRoom.privateRoom')}
            </ThemedText>
            <Switch
              value={local.isPrivate}
              onValueChange={(isPrivate) => setLocal((p) => ({ ...p, isPrivate }))}
              trackColor={{ false: theme.colors.border, true: theme.colors.neonGreen }}
              thumbColor={local.isPrivate ? '#000' : '#f4f3f4'}
            />
          </ThemedView>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: theme.colors.neonGreen }]}
          onPress={handleApply}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText weight="bold" style={{ color: '#000' }}>
              {t('createRoom.preset.applyButton')}
            </ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
          onPress={handleSave}
          disabled={saving}
        >
          <ThemedText weight="semiBold">{t('createRoom.preset.saveButton')}</ThemedText>
        </TouchableOpacity>
      </ThemedScrollView>

      {alertOptions && (
        <Alert
          visible={visible}
          type={alertOptions.type}
          title={alertOptions.title}
          message={alertOptions.message}
          confirmText={alertOptions.confirmText}
          cancelText={alertOptions.cancelText}
          onConfirm={alertOptions.onConfirm}
          onCancel={alertOptions.onCancel}
          onClose={hideAlert}
          autoClose={alertOptions.autoClose}
          autoCloseDelay={alertOptions.autoCloseDelay}
        />
      )}
    </ThemedSafeAreaView>
  );
};

export default CreateRoomPresetScreen;
