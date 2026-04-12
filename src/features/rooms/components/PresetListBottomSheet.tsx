import React, { useEffect, useRef } from 'react';
import {
  Modal,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@/shared/theme';
import { ThemedText } from '@/shared/components/themed/ThemedText';
import { TFunction } from 'i18next';
import { RoomPresetItem } from '../types/room.types';
import { useMatchPreset } from '../hooks/useMatchPreset';
import { matchFormatToUi } from '../utils/matchRoomCreatePresetMap';
import { getMatchFormatBadgeColor } from '@/shared/utils/matchFormatColors';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/app/navigation/types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.55;


interface PresetListBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectPreset: (preset: RoomPresetItem) => void;
  onSaveCurrentPreset: () => void;
  savingCurrentPreset?: boolean;
  t:TFunction;
}

const PresetListBottomSheet: React.FC<PresetListBottomSheetProps> = ({
  visible,
  onClose,
  onSelectPreset,
  onSaveCurrentPreset,
  savingCurrentPreset = false,
  t,
}) => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const { matchPresets, loading, refresh } = useMatchPreset({ page: 1, pageSize: 10 });
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: SHEET_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  const accentColor = theme.colors.neonGreen ?? theme.colors.primary;

  const renderPresetItem = ({ item }: { item: RoomPresetItem }) => {
    const uiFormat = matchFormatToUi(item.matchFormat);
    const formatColor = getMatchFormatBadgeColor(uiFormat, theme.colors.primary);

    const handleViewDetail = () => {
      handleClose();
      navigation.navigate('CreateRoomPreset', { presetId: item.presetId });
    };

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={[
          styles.presetCard,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
          },
        ]}
        onPress={() => {
          onSelectPreset(item);
          handleClose();
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.presetNameRow}>
            <Ionicons name="bookmark" size={16} color={accentColor} />
            <ThemedText size="m" weight="bold" style={{ flex: 1 }}>
              {item.roomName}
            </ThemedText>
          </View>
          <View style={[styles.formatBadge, { backgroundColor: formatColor + '20', borderColor: formatColor }]}>
            <ThemedText size="xs" weight="bold" style={{ color: formatColor }}>
              {uiFormat}
            </ThemedText>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
            <ThemedText variant="secondary" size="s">
              {item.durationMinutes} {t('createRoom.minutes', 'phút')}
            </ThemedText>
          </View>
          {!!item.venueName && (
            <View style={styles.infoRow}>
              <Ionicons name="football-outline" size={14} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" size="s" numberOfLines={1} style={{ flex: 1 }}>
                {item.venueName}
              </ThemedText>
            </View>
          )}
          {!!item.venueAddress && (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" size="s" numberOfLines={1} style={{ flex: 1 }}>
                {item.venueAddress}
              </ThemedText>
            </View>
          )}
          <View style={[styles.infoRow, { marginTop: 4 }]}>
            <TouchableOpacity
              style={[styles.viewDetailsButton, { borderColor: theme.colors.neonGreen }]}
              onPress={handleViewDetail}
            >
              <Ionicons name="pencil-outline" size={13} color={theme.colors.neonGreen} />
              <ThemedText size="s" weight="bold" style={{ color: theme.colors.neonGreen }}>
                {t('rooms.viewDetails', 'Xem & chỉnh sửa')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <View style={styles.container}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                backgroundColor: theme.colors.overlay || 'rgba(0,0,0,0.5)',
                opacity: backdropAnim,
              },
            ]}
          />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.background,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              height: SHEET_HEIGHT,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle bar */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>

          {/* Sheet header */}
          <View style={[styles.sheetHeader, { borderBottomColor: theme.colors.border }]}>
            <ThemedText size="xl" weight="bold">
              Match Presets
            </ThemedText>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          {/* { save button} */}
          <View style={styles.saveButtonContainer}>
            <TouchableOpacity
              style={[styles.saveButton, { borderColor: theme.colors.neonGreen }]}
              onPress={onSaveCurrentPreset}
              disabled={savingCurrentPreset}
            >
              {savingCurrentPreset ? (
                <ActivityIndicator size="small" color={theme.colors.neonGreen} />
              ) : (
                <Ionicons name="add" size={22} color={theme.colors.neonGreen} />
              )}
              <ThemedText size="m" weight="bold" style={{ color: theme.colors.neonGreen }}>
                {t('createRoom.preset.saveButton', 'Lưu lại')}
              </ThemedText>
            </TouchableOpacity>
          </View>
          {/* Preset list */}
          {loading ? (
            <View style={styles.centerState}>
              <ActivityIndicator size="large" color={accentColor} />
            </View>
          ) : matchPresets.length === 0 ? (
            <View style={styles.centerState}>
              <Ionicons name="bookmark-outline" size={40} color={theme.colors.textSecondary} />
              <ThemedText variant="secondary" size="m" style={{ marginTop: 12, textAlign: 'center' }}>
                {t('createRoom.preset.emptyList', 'Chưa có preset nào. Tạo preset trong màn hình tạo phòng.')}
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={matchPresets}
              keyExtractor={(item) => item.presetId}
              renderItem={({ item }) => renderPresetItem({ item })}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={refresh}
              refreshing={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  presetCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  presetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  formatBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 8,
  },
  cardBody: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewDetailsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

export { PresetListBottomSheet };
