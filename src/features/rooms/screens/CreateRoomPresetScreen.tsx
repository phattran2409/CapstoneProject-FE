import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTheme } from "@/shared/theme";
import { useTranslation } from "react-i18next";
import {
  ThemedSafeAreaView,
  ThemedView,
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
} from "@/shared/components/themed";
import { RootStackParamList } from "@/app/navigation/types";
import Alert from "@/shared/components/Alert";
import { useAlert } from "@/shared/hooks/useAlert";
import {
  useMatchRoomCreatePreset,
  useUpsertMatchRoomCreatePreset,
} from "../hooks/useMatchRoomCreatePreset";
import {
  useMatchPresetById,
  useUpdateMatchPreset,
  useDeleteMatchPreset,
} from "../hooks/useMatchPresetActions";
import type {
  MatchRoomCreatePresetDto,
  UpdateMatchPresetDto,
} from "../types/room.types";
import {
  matchFormatToUi,
  uiToMatchFormat,
  type UiMatchFormat,
} from "../utils/matchRoomCreatePresetMap";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatTime } from "@/shared/utils/dateUtils";

type CreateRoomPresetScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "CreateRoomPreset"
>;
type CreateRoomPresetScreenRouteProp = RouteProp<
  RootStackParamList,
  "CreateRoomPreset"
>;

const DURATION_OPTIONS = [60, 90, 120] as const;
const FORMATS: UiMatchFormat[] = ["5vs5", "7vs7", "11vs11"];

type LocalPreset = {
  matchFormat: UiMatchFormat;
  durationMinutes: 60 | 90 | 120;
  roomName: string;
  description: string;
  isPrivate: boolean;
  rules: string;
  password: string;
  startTime: string;
};

const defaultLocal = (): LocalPreset => ({
  matchFormat: "5vs5",
  durationMinutes: 60,
  roomName: "",
  startTime: "",
  rules: "",
  password: "",
  description: "",
  isPrivate: false,
});

interface Props {
  navigation?: CreateRoomPresetScreenNavigationProp;
  route?: CreateRoomPresetScreenRouteProp;
}

const CreateRoomPresetScreen: React.FC<Props> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    visible,
    alertOptions,
    showInfo,
    showSuccess,
    showDanger,
    hideAlert,
  } = useAlert();

  /** Chế độ: edit theo ID khi có presetId từ route, ngược lại dùng legacy single-preset */
  const presetId = route?.params?.presetId;
  const isEditMode = !!presetId;
  /** Tắt GET chi tiết khi đang/đã xóa để tránh refetch sau invalidate/removeQueries */
  const [presetDetailFetchEnabled, setPresetDetailFetchEnabled] =
    useState(true);

  // --- Legacy single-preset hooks (dùng khi không có presetId) ---
  const { data: serverPreset, isLoading: legacyLoading } =
    useMatchRoomCreatePreset();
  const { mutate: upsertPreset, isPending: legacySaving } =
    useUpsertMatchRoomCreatePreset();

  // --- By-ID hooks (dùng khi có presetId) ---
  const {
    data: presetById,
    isLoading: byIdLoading,
    isError: byIdError,
  } = useMatchPresetById(presetId, {
    enabled: presetDetailFetchEnabled,
  });
  const { mutate: updatePreset, isPending: updating } = useUpdateMatchPreset();
  const { mutate: deletePreset, isPending: deleting } = useDeleteMatchPreset();

  const isLoading = isEditMode ? byIdLoading : legacyLoading;
  const saving = isEditMode ? updating : legacySaving;

  const [local, setLocal] = useState<LocalPreset>(defaultLocal);
  // Điền form khi dữ liệu được load (legacy)
  useEffect(() => {
    if (isEditMode || !serverPreset) return;
    setLocal({
      matchFormat: matchFormatToUi(serverPreset.matchFormat),
      durationMinutes: serverPreset.durationMinutes as 60 | 90 | 120,
      roomName: serverPreset.roomName,
      description: serverPreset.description ?? "",
      isPrivate: serverPreset.visibility === "Private" ? true : false,
      rules: serverPreset.rules ?? "",
      password: serverPreset.password ?? "",
      startTime: presetById?.startTime ?? "",
    });
  }, [serverPreset, isEditMode]);

  // Điền form khi load theo presetId
  useEffect(() => {
    if (!isEditMode || !presetById) return;
    setLocal({
      matchFormat: matchFormatToUi(presetById.matchFormat),
      durationMinutes: (presetById.durationMinutes as 60 | 90 | 120) ?? 60,
      roomName: presetById.roomName,
      description: presetById.description ?? "",
      isPrivate: presetById.visibility === "Private",
      rules: presetById.rules ?? "",
      password: presetById.password ?? "",
      startTime: presetById.startTime ?? "",
    });
  }, [presetById, isEditMode]);

  const validate = useCallback(() => {
    if (!local.roomName.trim()) {
      showInfo(t("createRoom.title"), t("createRoom.preset.validationName"));
      return false;
    }
    return true;
  }, [local.roomName, showInfo, t]);

  const toUpdateDto = useCallback(
    (): UpdateMatchPresetDto => ({
      matchFormat: uiToMatchFormat(local.matchFormat),
      durationMinutes: local.durationMinutes,
      roomName: local.roomName.trim(),
      description: local.description ?? "",
      visibility: local.isPrivate ? "Private" : "Public",
    }),
    [local],
  );

  const toLegacyDto = useCallback(
    (): MatchRoomCreatePresetDto => ({
      matchFormat: uiToMatchFormat(local.matchFormat),
      durationMinutes: local.durationMinutes,
      roomName: local.roomName.trim(),
      description: local.description ?? "",
      visibility: local.isPrivate ? "Private" : "Public",
      rules: local.rules ?? "",
      password: local.password ?? "",
    }),
    [local],
  );

  /** Lưu (PUT khi edit mode, upsert khi legacy) */
  const handleSave = () => {
    if (!validate()) return;
    if (isEditMode && presetId) {
      updatePreset(
        { id: presetId, dto: toUpdateDto() },
        {
          onSuccess: () =>
            showSuccess(
              t("createRoom.preset.savedTitle"),
              t("createRoom.preset.savedMessage"),
              () => {},
              true,
            ),
          onError: (e: unknown) =>
            showDanger(
              t("common.error"),
              e instanceof Error ? e.message : t("createRoom.preset.saveError"),
              () => {},
            ),
        },
      );
    } else {
      upsertPreset(toLegacyDto(), {
        onSuccess: () =>
          showSuccess(
            t("createRoom.preset.savedTitle"),
            t("createRoom.preset.savedMessage"),
            () => {},
            true,
          ),
        onError: (e: unknown) =>
          showDanger(
            t("common.error"),
            e instanceof Error ? e.message : t("createRoom.preset.saveError"),
            () => {},
          ),
      });
    }
  };

  /** Áp dụng rồi quay lại CreateRoom (chỉ dành cho legacy mode) */
  const handleApply = () => {
    if (!validate()) return;
    upsertPreset(toLegacyDto(), {
      onSuccess: () => {
        navigation?.navigate({
          name: "CreateRoom",
          params: { presetApplyNonce: Date.now() },
          merge: true,
        });
      },
      onError: (e: unknown) =>
        showDanger(
          t("common.error"),
          e instanceof Error ? e.message : t("createRoom.preset.saveError"),
          () => {},
        ),
    });
  };

  /** Xoá preset — hiện confirm trước */
  const handleDeletePress = () => {
    showDanger(
      t("createRoom.preset.deleteTitle", "Xoá preset"),
      t(
        "createRoom.preset.deleteConfirm",
        "Bạn có chắc muốn xoá preset này không?",
      ),
      () => {
        if (!presetId) return;
        setPresetDetailFetchEnabled(false);
        deletePreset(presetId, {
          onSuccess: () => {
            setTimeout(() => {
              navigation?.goBack();
            }, 1000);
            showSuccess(
              t("createRoom.preset.deletedTitle", "Xoá preset thành công"),
              t("createRoom.preset.deletedMessage", "Preset đã được xoá"),
              () => {},
              true,
            );
          },
          onError: (e: unknown) =>
            showDanger(
              t("common.error"),
              e instanceof Error
                ? e.message
                : t("createRoom.preset.deleteError", "Xoá thất bại"),
              () => {},
            ),
        });
      },
    );
  };

  const styles = StyleSheet.create({
    safeArea: { paddingVertical: 24 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 20,
      paddingHorizontal: 20,
      paddingVertical: 12,
      gap: 12,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 20,
      backgroundColor: theme.colors.error + "18",
    },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },
    section: { marginBottom: 20 },
    sectionTitle: { marginBottom: 10, marginTop: 10 },
    formatRow: { flexDirection: "row", gap: 10 },
    formatBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: "center",
    },
    durationRow: { flexDirection: "row", gap: 8 },
    durationBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
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
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
    },
    primaryBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 10,
    },
    secondaryBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
      borderWidth: 1,
    },
    dangerBtn: {
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 8,
      borderWidth: 1,
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
    },
  });

  if (isLoading) {
    return (
      <ThemedSafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.neonGreen} />
      </ThemedSafeAreaView>
    );
  }

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      <ThemedView
        style={[
          styles.header,
          { borderBottomWidth: 1, borderBottomColor: theme.colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          style={styles.backButton}
        >
          <ThemedIcon name="arrow-back" size={24} variant="secondary" />
        </TouchableOpacity>
        <ThemedText size="xl" weight="bold" style={{ flex: 1 }}>
          {isEditMode
            ? t("createRoom.preset.editTitle", "Chỉnh sửa Preset")
            : t("createRoom.preset.title")}
        </ThemedText>
        {isEditMode && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeletePress}
            disabled={deleting}
          >
            {deleting ? (
              <ActivityIndicator size="small" color={theme.colors.error} />
            ) : (
              <Ionicons
                name="trash-outline"
                size={20}
                color={theme.colors.error}
              />
            )}
          </TouchableOpacity>
        )}
      </ThemedView>

      <ThemedScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {byIdError && isEditMode && (
          <ThemedText
            variant="muted"
            size="s"
            style={{ marginBottom: 12, color: theme.colors.error }}
          >
            {t("createRoom.preset.loadError")}
          </ThemedText>
        )}

        <ThemedText
          variant="secondary"
          size="xs"
          style={{ marginBottom: 16, lineHeight: 18 }}
        >
          {t("createRoom.preset.bookingHint")}
        </ThemedText>

        {/* Match Format */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.selectFormat")}
          </ThemedText>
          <View style={styles.formatRow}>
            {FORMATS.map((f) => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.formatBtn,
                  {
                    backgroundColor:
                      local.matchFormat === f
                        ? theme.colors.neonGreen
                        : theme.colors.surface,
                  },
                ]}
                onPress={() => setLocal((p) => ({ ...p, matchFormat: f }))}
              >
                <ThemedText
                  weight="bold"
                  style={{
                    color:
                      local.matchFormat === f
                        ? "#000"
                        : theme.colors.textSecondary,
                  }}
                >
                  {f}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.duration")}
          </ThemedText>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((d) => (
              <TouchableOpacity
                key={d}
                style={[
                  styles.durationBtn,
                  {
                    backgroundColor:
                      local.durationMinutes === d
                        ? theme.colors.neonGreen
                        : theme.colors.surface,
                    borderColor:
                      local.durationMinutes === d
                        ? theme.colors.neonGreen
                        : theme.colors.border,
                  },
                ]}
                onPress={() => setLocal((p) => ({ ...p, durationMinutes: d }))}
              >
                <ThemedText
                  weight="semiBold"
                  style={{
                    color:
                      local.durationMinutes === d
                        ? "#000"
                        : theme.colors.textSecondary,
                  }}
                >
                  {d} {t("createRoom.minutes")}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Venue */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.venue")}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[
              styles.inputWrap,
              { borderColor: theme.colors.border, padding: 10 },
            ]}
          >
            <ThemedText
              size="xl"
              weight="bold"
              style={{ color: theme.colors.text }}
            >
              {presetById?.venueName}
            </ThemedText>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                paddingHorizontal: 10,
              }}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={theme.colors.neonGreen}
              />
              <ThemedText
                size="s"
                weight="regular"
                style={{ color: theme.colors.text }}
              >
                {presetById?.venueAddress}
              </ThemedText>
            </View>
          </ThemedView>
        </View>

        {/* Room Name */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.roomName")}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.inputWrap, { borderColor: theme.colors.border }]}
          >
            <TextInput
              style={{ color: theme.colors.text, fontSize: 16 }}
              placeholder={t("createRoom.roomNamePlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              value={local.roomName}
              onChangeText={(roomName) => setLocal((p) => ({ ...p, roomName }))}
            />
          </ThemedView>
        </View>
        {/* Rules */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("roomDetail.editRoomInfoRules")}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.inputWrap, { borderColor: theme.colors.border }]}
          >
            <TextInput
              style={{ color: theme.colors.text, fontSize: 16 }}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
              placeholder={t("roomDetail.editRoomInfoRulesPlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              value={local.rules}
              onChangeText={(rules) => setLocal((p) => ({ ...p, rules }))}
            />
          </ThemedView>
        </View>
        {/* Description */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.description")}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.inputWrap, { borderColor: theme.colors.border }]}
          >
            <TextInput
              style={{ color: theme.colors.text, fontSize: 16 }}
              placeholder={t("createRoom.descriptionPlaceholder")}
              placeholderTextColor={theme.colors.textSecondary}
              value={local.description}
              onChangeText={(description) =>
                setLocal((p) => ({ ...p, description }))
              }
            />
          </ThemedView>
        </View>
        {/* Start Time */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.matchTime")}
          </ThemedText>
          <View
            style={[
              styles.inputWrap,
              {
                flexDirection: "row",
                gap: 10,
                backgroundColor: theme.colors.surface,
                borderWidth: 1,
                borderColor: theme.colors.border,
              },
            ]}
            pointerEvents="none"
          >
            <ThemedIcon name="time" size={20} variant="secondary" />
            <ThemedText variant="muted" size="m">
              {local.startTime
                ? local.startTime.substring(0, 5)
                : "00:00" }
            </ThemedText>
          </View>
        </View>
        {/* Private Room */}
        <View style={styles.section}>
          <ThemedText
            variant="muted"
            size="m"
            weight="semiBold"
            style={styles.sectionTitle}
          >
            {t("createRoom.roomSettings")}
          </ThemedText>
          <ThemedView
            variant="surface"
            style={[styles.settingsRow, { borderColor: theme.colors.border }]}
          >
            <ThemedText variant="muted" size="m">
              {t("createRoom.privateRoom")}
            </ThemedText>
            <Switch
              value={local.isPrivate}
              onValueChange={(isPrivate) =>
                setLocal((p) => ({ ...p, isPrivate }))
              }
              trackColor={{
                false: theme.colors.border,
                true: theme.colors.neonGreen,
              }}
              thumbColor={local.isPrivate ? "#000" : "#f4f3f4"}
            />
          </ThemedView>
        </View>
        {/* Password */}
        {local.isPrivate && (
          <View style={styles.section}>
            <ThemedText
              variant="muted"
              size="m"
              weight="semiBold"
              style={styles.sectionTitle}
            >
              {t("createRoom.password")}
            </ThemedText>
            <ThemedView
              variant="surface"
              style={[styles.inputWrap, { borderColor: theme.colors.border }]}
            >
              <TextInput
                style={{ color: theme.colors.text, fontSize: 16 }}
                placeholder={t("createRoom.passwordPlaceholder")}
                placeholderTextColor={theme.colors.textSecondary}
                value={local.password}
                onChangeText={(password) =>
                  setLocal((p) => ({ ...p, password }))
                }
              />
            </ThemedView>
          </View>
        )}
        {/* Primary CTA: Lưu (edit) / Áp dụng (legacy) */}
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            { backgroundColor: theme.colors.neonGreen },
          ]}
          onPress={isEditMode ? handleSave : handleApply}
          disabled={saving || deleting}
        >
          {saving ? (
            <ActivityIndicator color="#000" />
          ) : (
            <ThemedText weight="bold" style={{ color: "#000" }}>
              {isEditMode
                ? t("common.buttons.save", "Lưu thay đổi")
                : t("createRoom.preset.applyButton")}
            </ThemedText>
          )}
        </TouchableOpacity>

        {/* Secondary: Lưu không áp dụng (chỉ legacy) */}
        {!isEditMode && (
          <TouchableOpacity
            style={[styles.secondaryBtn, { borderColor: theme.colors.border }]}
            onPress={handleSave}
            disabled={saving}
          >
            <ThemedText weight="semiBold">
              {t("createRoom.preset.saveButton")}
            </ThemedText>
          </TouchableOpacity>
        )}
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
