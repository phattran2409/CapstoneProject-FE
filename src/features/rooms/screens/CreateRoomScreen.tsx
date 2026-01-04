import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Switch, Alert, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon 
} from '@/shared/components/themed';
import { useCreateRoom, useActiveRoomStore } from '@/features/rooms';
import { RootStackParamList } from '@/app/navigation/types';

type CreateRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateRoom'>;

interface CreateRoomScreenProps {
  navigation?: CreateRoomScreenNavigationProp;
  route?: {
    params?: {
      selectedVenue?: Venue;
    };
  };
}

interface Venue {
  id: string;
  name: string;
  address: string;
  price: number;
  rating: number;
  image: any;
}

type MatchFormat = '5vs5' | '7vs7';

const CreateRoomScreen: React.FC<CreateRoomScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [selectedFormat, setSelectedFormat] = useState<MatchFormat>('5vs5');
  const [roomName, setRoomName] = useState('');
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(
    route?.params?.selectedVenue || null
  );
  const [matchDate, setMatchDate] = useState(new Date());
  const [matchTime, setMatchTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Use React Query mutation
  const { mutate: createRoom, isPending: isCreating } = useCreateRoom();
  const { setActiveRoom } = useActiveRoomStore();

  // Update venue when returning from VenueSelection
  React.useEffect(() => {
    if (route?.params?.selectedVenue) {
      setSelectedVenue(route.params.selectedVenue);
    }
  }, [route?.params?.selectedVenue]);

  const handleCreateRoom = () => {
    // Validate
    if (!roomName.trim()) {
      Alert.alert(t('createRoom.title'), t('createRoom.validation.nameRequired'));
      return;
    }
    if (!selectedVenue) {
      Alert.alert(t('createRoom.title'), t('createRoom.validation.venueRequired'));
      return;
    }
    if (isPrivate && !password.trim()) {
      Alert.alert(t('createRoom.title'), t('createRoom.validation.passwordRequired'));
      return;
    }

    // Combine date and time
    const datetime = new Date(
      matchDate.getFullYear(),
      matchDate.getMonth(),
      matchDate.getDate(),
      matchTime.getHours(),
      matchTime.getMinutes()
    );

    // ✅ Call create room mutation
    createRoom(
      {
        format: selectedFormat,
        datetime: datetime.toISOString(),
        venueId: selectedVenue.id,
        name: roomName,
        isPrivate,
        password: isPrivate ? password : undefined,
      },
      {
        onSuccess: async (newRoom) => {
          Alert.alert('Success', 'Room created successfully!');
          // Save active room ID to storage
          if (newRoom?.id) {
            await setActiveRoom(newRoom.id);
            navigation?.navigate('RoomInformation', { roomId: newRoom.id });
          } else {
            navigation?.goBack();
          }
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to create room');
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
          <ThemedText size="xxl" weight="bold">
            {t('createRoom.title')}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.scrollContent}>
          {/* Match Format Selection */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.selectFormat')}
            </ThemedText>
            <View style={styles.formatRow}>
              <TouchableOpacity
                style={[styles.formatButton, { backgroundColor: selectedFormat === '5vs5' ? theme.colors.neonGreen : theme.colors.surface }]}
                onPress={() => setSelectedFormat('5vs5')}
              >
                <ThemedText 
                  size="l" 
                  weight="bold" 
                  style={[styles.formatButtonText, { color: selectedFormat === '5vs5' ? '#000' : theme.colors.textSecondary }]}
                >
                  5 vs 5
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formatButton, { backgroundColor: selectedFormat === '7vs7' ? theme.colors.neonGreen : theme.colors.surface }]}
                onPress={() => setSelectedFormat('7vs7')}
              >
                <ThemedText 
                  size="l" 
                  weight="bold" 
                  style={[styles.formatButtonText, { color: selectedFormat === '7vs7' ? '#000' : theme.colors.textSecondary }]}
                >
                  7 vs 7
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Room Name */}
          <View style={styles.section}>
            <ThemedText variant='muted' size="m" weight="semiBold" style={styles.sectionTitle}>
              {t('createRoom.roomName')}
            </ThemedText>
            <ThemedView 
              variant="surface"
              style={[styles.inputContainer, { borderWidth: 1, borderColor: theme.colors.border }]}
            >
              <TextInput
                style={{ color: theme.colors.text, fontSize: 16 }}
                placeholder={t('createRoom.roomNamePlaceholder')}
                placeholderTextColor={theme.colors.textSecondary}
                value={roomName}
                onChangeText={setRoomName}
              />
            </ThemedView>
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
              onPress={() => navigation?.navigate('VenueSelection')}
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

          {/* Date and Time */}
          <View style={styles.dateTimeRow}>
            {/* Date */}
            <View style={styles.dateTimeContainer}>
              <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
                {t('createRoom.matchDate')}
              </ThemedText>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText variant="muted" size="m">
                  {formatDate(matchDate)}
                </ThemedText>
                <ThemedIcon name="calendar" size={20} variant="secondary" />
              </TouchableOpacity>
            </View>

            {/* Time */}
            <View style={styles.dateTimeContainer}>
              <ThemedText variant="muted" size="m" weight="semiBold" style={styles.sectionTitle}>
                {t('createRoom.matchTime')}
              </ThemedText>
              <TouchableOpacity
                style={[styles.dateTimeButton, { 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border 
                }]}
                onPress={() => setShowTimePicker(true)}
              >
                <ThemedText variant="muted" size="m">
                  {formatTime(matchTime)}
                </ThemedText>
                <ThemedIcon  name="time" size={20} variant="secondary" />
              </TouchableOpacity>
            </View>
          </View>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                value={matchDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    setMatchDate(selectedDate);
                  }
                }}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                value={matchTime}
                mode="time"
                display="default"
                is24Hour={true}
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    setMatchTime(selectedTime);
                  }
                }}
              />
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
              onPress={handleCreateRoom}
            >
              <ThemedText size="l" weight="bold" style={[styles.createButtonText, { color: '#000' }]}>
                {t('createRoom.createButton')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedScrollView> 
    </ThemedSafeAreaView>
   
  );
};

export default CreateRoomScreen;

