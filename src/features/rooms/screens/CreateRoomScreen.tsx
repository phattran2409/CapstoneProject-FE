import React, { useState } from 'react';
import {Text, View, TouchableOpacity, TextInput, Switch, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon 
} from '@/shared/components/themed';
import { useCreateRoom, useActiveRoomStore } from '@/features/rooms';
import { RootStackParamList } from '@/app/navigation/types';
import { useAuthStore } from '@/features/auth';
import { Venue, Field, TimeSlot } from '@/features/venues/types/venue.types';
import Alert from '@/shared/components/Alert';
import { useAlert } from '@/shared/hooks/useAlert';
import { Controller, useForm } from 'react-hook-form';
import { RoomFormData, roomSchema } from '../validation/roomSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { getTranslatedError } from '@/shared/utils/errorTranslations';
import { roomsApi } from '../api/roomsApi';
import { matchFormatToUi } from '../utils/matchRoomCreatePresetMap';

type CreateRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;
type CreateRoomScreenRouteProp = RouteProp<RootStackParamList, 'CreateRoom'>;

interface CreateRoomScreenProps {
  navigation?: CreateRoomScreenNavigationProp;
  route?: CreateRoomScreenRouteProp;
}

type MatchFormat = '5vs5' | '7vs7' | '11vs11';
type DurationMinutes = 60 | 90 | 120;

const DURATION_OPTIONS: DurationMinutes[] = [ 60, 90, 120];

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { visible, alertOptions, showInfo, showSuccess, showDanger, hideAlert } = useAlert();
  const [selectedFormat, setSelectedFormat] = useState<MatchFormat>('5vs5');
  const [durationMinutes, setDurationMinutes] = useState<DurationMinutes>(60);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      roomName: '',
      description: '',
    },
  });
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(
    route?.params?.selectedVenue || null
  );
  const [selectedField, setSelectedField] = useState<Field | null>(
    route?.params?.selectedField || null
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(
    route?.params?.selectedTimeSlot || null
  );
  const [matchDate, setMatchDate] = useState(new Date());
  const [matchTime, setMatchTime] = useState(new Date());
  const [isPrivate, setIsPrivate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Use React Query mutation
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { setActiveRoom } = useActiveRoomStore();
  
  const FormatMatch = (format: MatchFormat): 'FiveVsFive' | 'SevenVsSeven' | 'ElevenVsEleven' | undefined => {
    switch (format) {
      case '5vs5':
        return 'FiveVsFive';
      case '7vs7':
        return 'SevenVsSeven';
      case '11vs11':
        return 'ElevenVsEleven';
      default:
        return undefined;
    }
  }

  // Update data when returning from VenueSelection / VenueDetail (TimeSlot + date from field)
  React.useEffect(() => {
    if (route?.params?.selectedVenue) {
      setSelectedVenue(route.params.selectedVenue);
    }
    if (route?.params?.selectedField) {
      setSelectedField(route.params.selectedField);
    }
    if (route?.params?.selectedTimeSlot) {
      setSelectedTimeSlot(route.params.selectedTimeSlot);
      const [hours, minutes] = route.params.selectedTimeSlot.startTime.split(':').map(Number);
      const newTime = new Date();
      newTime.setHours(hours, minutes, 0, 0);
      setMatchTime(newTime);
    }
    if (route?.params?.selectedDate) {
      const d = new Date(route.params.selectedDate + 'T00:00:00');
      if (!isNaN(d.getTime())) setMatchDate(d);
    }
  }, [route?.params?.selectedVenue, route?.params?.selectedField, route?.params?.selectedTimeSlot, route?.params?.selectedDate]);

  React.useEffect(() => {
    const nonce = route?.params?.presetApplyNonce;
    if (nonce == null) return;
    void (async () => {
      const p = await roomsApi.getCreateRoomPreset();
      if (!p) return;
      setSelectedFormat(matchFormatToUi(p.matchFormat));
      setDurationMinutes(p.durationMinutes);
      reset({ roomName: p.roomName, description: p.description || '' });
      setIsPrivate(p.isPrivate);
      setPassword('');
    })();
  }, [route?.params?.presetApplyNonce, reset]);

  const handleCreateRoom = (data: RoomFormData) => {
    setIsLoading(true);
    // Validate

    if (!selectedVenue) {
      showInfo(t('createRoom.title'), t('createRoom.validation.venueRequired'));
      return;
    }
    if (isPrivate && !password.trim()) {
      showInfo(t('createRoom.title'), t('createRoom.validation.passwordRequired'));
      return;
    }
    
    const datetime = new Date(
      matchDate.getFullYear(),
      matchDate.getMonth(),
      matchDate.getDate(),
      matchTime.getHours(),
      matchTime.getMinutes()
    );

    // Use TimeSlot from field when available; otherwise fallback to matchDate/matchTime
    const startTimeStr = selectedTimeSlot?.startTime
      ? selectedTimeSlot.startTime.substring(0, 5)
      : formatTime(matchTime);

    createRoom(
      {
        fieldId: selectedField?.fieldId || '',
        matchDate: datetime.toISOString(),
        startTime: startTimeStr,
        durationMinutes,
        matchFormat: FormatMatch(selectedFormat) ?? (selectedFormat as string),
        roomName: data.roomName,
        description: data.description || '',
        rules: '',
        visibility: isPrivate ? 'Private' : 'Public',
        ...(isPrivate && password.trim() ? { password: password.trim() } : {}),
      },
      {
        onSuccess: async (newRoom) => {
          // autoClose: false để user bấm OK mới đóng → onConfirm chạy → replace (nếu autoClose: true
          // alert tự đóng sau 3s và không gọi onConfirm, nên replace không chạy, Back từ Room vẫn về CreateRoom)
          showSuccess(
            t('common.success'),
            t('createRoom.successMessage'),
            async () => {
              if (newRoom?.roomId) {
                await setActiveRoom(newRoom.roomId);
                // Reset stack: đảm bảo Back từ RoomInformation luôn về MatchesScreen
                // bất kể trước đó VenueSelection hay bao nhiêu screen còn trong stack
                navigation?.dispatch(
                  CommonActions.reset({
                    index: 1,
                    routes: [
                      { name: 'MainTabs', params: { screen: 'Matches' } },
                      { name: 'RoomInformation', params: { roomId: newRoom.roomId } },
                    ],
                  })
                );
              } else {
                navigation?.goBack();
              }
            },
            false
          );
        },
        onError: (error: any) => {
          setIsLoading(false);
          showDanger(t('common.error'), getTranslatedError(error?.message) || t('createRoom.errorMessage'), () => {});
        },
      }
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false,
    });
  };
  const getErrorMessage = (message?: string) => {
    if (!message) return '';
    return message.startsWith('createRoom.validation.') ? t(message) : message;
  }

  const styles = StyleSheet.create({
    safeArea: {
      paddingVertical: 40,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flex: 1,
    },
    presetButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingVertical: 24,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      marginBottom: 12,
    },
    formatRow: {
      flexDirection: 'row',
      gap: 12,
    },
    formatButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
    },
    formatButtonText: {
      textAlign: 'center',
    },
    durationRow: {
      flexDirection: 'row',
      gap: 8,
    },
    durationButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    durationButtonText: {
      textAlign: 'center',
    },
    inputContainer: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
    venueButton: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    venueContent: {
      flex: 1,
    },
    venueAddress: {
      marginTop: 4,
    },
    dateTimeRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    dateTimeContainer: {
      flex: 1,
    },
    dateTimeButton: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    settingsContainer: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    passwordContainer: {
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 16,
      flexDirection: 'row',
      alignItems: 'center',
    },
    passwordInput: {
      flex: 1,
    },
    createButton: {
      borderRadius: 16,
      paddingVertical: 16,
      marginTop: 16,
    },
    createButtonText: {
      textAlign: 'center',
    },
    errorText: {
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
    },
  });

  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      {/* Header */}
      <ThemedView 
        style={[styles.header, { borderBottomWidth: 1, borderBottomColor: theme.colors.border }]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.backButton}
          >
            <ThemedIcon name="arrow-back"  size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xxl" weight="bold" style={{ flexShrink: 1 }}>
            {t('createRoom.title')}
          </ThemedText>
        </View>
        <TouchableOpacity
          onPress={() => navigation?.navigate('CreateRoomPreset')}
          style={styles.presetButton}
          accessibilityRole="button"
          accessibilityLabel={t('createRoom.preset.openButton')}
        >
          <ThemedIcon name="bookmark-outline" size={26} variant="accent" />
        </TouchableOpacity>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {/* Match Format Selection */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.selectFormat')}
            </ThemedText>
            <View style={styles.formatRow}>
              {["5vs5", "7vs7" , "11vs11"].map((format) => (
                <TouchableOpacity
                  key={format}
                  style={[styles.formatButton, { backgroundColor: selectedFormat === format ? theme.colors.neonGreen : theme.colors.surface }]}
                  onPress={() => setSelectedFormat(format as MatchFormat)}
                >
                  <ThemedText size="l" weight="bold" style={[styles.formatButtonText, { color: selectedFormat === format ? '#000' : theme.colors.textSecondary }]}>
                    {format}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Duration Selection */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.duration')}
            </ThemedText>
            <View style={styles.durationRow}>
              {DURATION_OPTIONS.map((duration) => (
                <TouchableOpacity
                  key={duration}
                  style={[
                    styles.durationButton, 
                    { 
                      backgroundColor: durationMinutes === duration 
                        ? theme.colors.neonGreen 
                        : theme.colors.surface,
                      borderWidth: 1,
                      borderColor: durationMinutes === duration 
                        ? theme.colors.neonGreen 
                        : theme.colors.border,
                    }
                  ]}
                  onPress={() => setDurationMinutes(duration)}
                >
                  <ThemedText 
                    size="m" 
                    weight="semiBold" 
                    style={[
                      styles.durationButtonText, 
                      { 
                        color: durationMinutes === duration 
                          ? '#000' 
                          : theme.colors.textSecondary 
                      }
                    ]}
                  >
                    {duration} {t('createRoom.minutes')}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
            {/* Venue Selection */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.venue')}
            </ThemedText>
            <TouchableOpacity
              style={[styles.venueButton, { 
                backgroundColor: theme.colors.surface,
                borderWidth: 1, 
                borderColor: theme.colors.border 
              }]}
              onPress={() => navigation?.navigate('VenueSelection', { matchFormat: FormatMatch(selectedFormat) })}
            >
              {selectedVenue ? (
                <View style={styles.venueContent}>
                  <ThemedText variant="muted" size="m" weight="semiBold">
                    {selectedVenue.name}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s" style={styles.venueAddress}>
                    {selectedVenue.address}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText variant="secondary" size="m" style={styles.venueContent}>
                  {t('createRoom.venuePlaceholder')}
                </ThemedText>
              )}
              <ThemedIcon name="location" size={24} variant="accent" />
            </TouchableOpacity>
          </View>

          {/* Room Name */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.roomName')}
            </ThemedText>
            <Controller
              control={control}
              name="roomName"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedView 
                  variant="surface"
                  style={[styles.inputContainer, { borderWidth: 1, borderColor: theme.colors.border }]}
                >
                  <TextInput
                    style={{ color: theme.colors.text, fontSize: 16 }}
                    placeholder={t('createRoom.roomNamePlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </ThemedView>
              )}
            />
          {errors.roomName && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {getErrorMessage(errors.roomName.message)}
            </Text>
          )}
          </View>
          {/* Description */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.description')}
            </ThemedText>
            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <ThemedView 
                  variant="surface"
                  style={[styles.inputContainer, { borderWidth: 1, borderColor: theme.colors.border }]}
                >
                  <TextInput
                    style={{ color: theme.colors.text, fontSize: 16 }}
                    placeholder={t('createRoom.descriptionPlaceholder')}
                    placeholderTextColor={theme.colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                </ThemedView>
              )}
            />
          {errors.description && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {getErrorMessage(errors.description.message)}
            </Text>
          )}
          </View>

          {/* Date and Time - read-only from TimeSlot khi đã chọn sân (DateTimePicker đã tắt) */}
          <View style={styles.dateTimeRow}>
            <View style={styles.dateTimeContainer}>
              <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
                {t('createRoom.matchDate')}
              </ThemedText>
              <View
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border,
                  opacity: selectedTimeSlot ? 1 : 0.7,
                }]}
                pointerEvents="none"
              >
                <ThemedText variant="muted" size="m">
                  {formatDate(matchDate)}
                </ThemedText>
                <ThemedIcon name="calendar" size={20} variant="secondary" />
              </View>
            </View>
            <View style={styles.dateTimeContainer}>
              <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
                {t('createRoom.matchTime')}
              </ThemedText>
              <View
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border,
                  opacity: selectedTimeSlot ? 1 : 0.7,
                }]}
                pointerEvents="none"
              >
                <ThemedText variant="muted" size="m">
                  {selectedTimeSlot ? selectedTimeSlot.startTime.substring(0, 5) : formatTime(matchTime)}
                </ThemedText>
                <ThemedIcon name="time" size={20} variant="secondary" />
              </View>
            </View>
          </View>
          {!selectedTimeSlot && (
            <ThemedText variant="muted" size="s" style={{ marginTop: 4 }}>
              Chọn sân (venue) và khung giờ để tự động điền ngày & giờ
            </ThemedText>
          )}

          {/* Room Settings */}
          <View style={styles.section}>
            <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.roomSettings')}
            </ThemedText>
            <ThemedView 
              variant="surface"
              style={[styles.settingsContainer, { borderWidth: 1, borderColor: theme.colors.border }]}
            >
              <ThemedText variant="muted" size="m">
                {t('createRoom.privateRoom')}
              </ThemedText>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: theme.colors.border, true: theme.colors.neonGreen }}
                thumbColor={isPrivate ? '#000' : '#f4f3f4'}
              />
            </ThemedView>
          </View>

          {/* Password (if private) */}
          {isPrivate && (
            <View style={styles.section}>
              <ThemedText size="m" weight="semiBold" style={styles.sectionTitle}>
                {t('createRoom.password')}
              </ThemedText>
              <ThemedView 
                variant="surface"
                style={[styles.passwordContainer, { borderWidth: 1, borderColor: theme.colors.border }]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: theme.colors.text, fontSize: 16 }]}
                  placeholder={t('createRoom.passwordPlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <ThemedIcon 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    variant="secondary"
                  />
                </TouchableOpacity>
              </ThemedView>
            </View>
          )}

            {/* Create Button */}
            <TouchableOpacity
              style={[styles.createButton, {
                backgroundColor: theme.colors.neonGreen,
                shadowColor: theme.colors.neonGreen,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }]}
              onPress={handleSubmit(handleCreateRoom)}
              disabled={isLoading}
            >
              <ThemedText size="l" weight="bold" style={[styles.createButtonText, { color: '#000' }]}>
                {isLoading ? <ActivityIndicator size="small" color={theme.colors.darkBlack} /> : t('createRoom.createButton')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedScrollView>

        {/* Custom Alert */}
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

export default CreateRoomScreen;

