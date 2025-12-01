import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon 
} from '../components/themed';

type RootStackParamList = {
  Matches: undefined;
  CreateRoom: undefined;
  VenueSelection: undefined;
};

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

  // Update venue when returning from VenueSelection
  React.useEffect(() => {
    if (route?.params?.selectedVenue) {
      setSelectedVenue(route.params.selectedVenue);
    }
  }, [route?.params?.selectedVenue]);

  const handleCreateRoom = () => {
    // Validate and create room
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

    // Handle create room logic here
    console.log({
      format: selectedFormat,
      roomName,
      venue: selectedVenue,
      date: matchDate,
      time: matchTime,
      isPrivate,
      password: isPrivate ? password : null,
    });

    // Navigate back or show success
    navigation?.goBack();
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

  return (
    <ThemedSafeAreaView className='py-10'>
      {/* Header */}
      <ThemedView 
        className="flex-row items-center justify-between px-5 py-4"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <ThemedIcon name="arrow-back"  size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xxl" weight="bold">
            {t('createRoom.title')}
          </ThemedText>
        </View>
      </ThemedView>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Match Format Selection */}
          <View className="mb-6">
            <ThemedText variant='muted' size="m" weight="semiBold" className="mb-3">
              {t('createRoom.selectFormat')}
            </ThemedText>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{ backgroundColor: selectedFormat === '5vs5' ? theme.colors.neonGreen : theme.colors.surface }}
                onPress={() => setSelectedFormat('5vs5')}
              >
                <ThemedText 
                  size="l" 
                  weight="bold" 
                  className="text-center"
                  style={{ color: selectedFormat === '5vs5' ? '#000' : theme.colors.textSecondary }}
                >
                  5 vs 5
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 py-4 rounded-2xl"
                style={{ backgroundColor: selectedFormat === '7vs7' ? theme.colors.neonGreen : theme.colors.surface }}
                onPress={() => setSelectedFormat('7vs7')}
              >
                <ThemedText 
                  size="l" 
                  weight="bold" 
                  className="text-center"
                  style={{ color: selectedFormat === '7vs7' ? '#000' : theme.colors.textSecondary }}
                >
                  7 vs 7
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          {/* Room Name */}
          <View className="mb-6">
            <ThemedText variant='muted' size="m" weight="semiBold" className="mb-3">
              {t('createRoom.roomName')}
            </ThemedText>
            <ThemedView 
              variant="surface"
              className="rounded-2xl px-4 py-4"
              style={{ borderWidth: 1, borderColor: theme.colors.border }}
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
          <View className="mb-6">
            <ThemedText variant='muted' size="m" weight="semiBold" className="mb-3">
              {t('createRoom.venue')}
            </ThemedText>
            <TouchableOpacity
              className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
              style={{ 
                backgroundColor: theme.colors.surface,
                borderWidth: 1, 
                borderColor: theme.colors.border 
              }}
              onPress={() => navigation?.navigate('VenueSelection')}
            >
              {selectedVenue ? (
                <View className="flex-1">
                  <ThemedText variant="muted" size="m" weight="semiBold">
                    {selectedVenue.name}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s" className="mt-1">
                    {selectedVenue.address}
                  </ThemedText>
                </View>
              ) : (
                <ThemedText variant="secondary" size="m" className="flex-1">
                  {t('createRoom.venuePlaceholder')}
                </ThemedText>
              )}
              <ThemedIcon name="location" size={24} variant="accent" />
            </TouchableOpacity>
          </View>

          {/* Date and Time */}
          <View className="flex-row gap-3 mb-6">
            {/* Date */}
            <View className="flex-1">
              <ThemedText variant="muted" size="m" weight="semiBold" className="mb-3">
                {t('createRoom.matchDate')}
              </ThemedText>
              <TouchableOpacity
                className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border 
                }}
                onPress={() => setShowDatePicker(true)}
              >
                <ThemedText variant="muted" size="m">
                  {formatDate(matchDate)}
                </ThemedText>
                <ThemedIcon name="calendar" size={20} variant="secondary" />
              </TouchableOpacity>
            </View>

            {/* Time */}
            <View className="flex-1">
              <ThemedText variant="muted" size="m" weight="semiBold" className="mb-3">
                {t('createRoom.matchTime')}
              </ThemedText>
              <TouchableOpacity
                className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
                style={{ 
                  backgroundColor: theme.colors.surface,
                  borderWidth: 1, 
                  borderColor: theme.colors.border 
                }}
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
          <View className="mb-6">
            <ThemedText variant="muted" size="m" weight="semiBold" className="mb-3">
              {t('createRoom.roomSettings')}
            </ThemedText>
            <ThemedView 
              variant="surface"
              className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
              style={{ borderWidth: 1, borderColor: theme.colors.border }}
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
            <View className="mb-6">
              <ThemedText size="m" weight="semiBold" className="mb-3">
                {t('createRoom.password')}
              </ThemedText>
              <ThemedView 
                variant="surface"
                className="rounded-2xl px-4 py-4 flex-row items-center"
                style={{ borderWidth: 1, borderColor: theme.colors.border }}
              >
                <TextInput
                  className="flex-1"
                  style={{ color: theme.colors.text, fontSize: 16 }}
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
              className="rounded-2xl py-4 mt-4"
              style={{
                backgroundColor: theme.colors.neonGreen,
                shadowColor: theme.colors.neonGreen,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={handleCreateRoom}
            >
              <ThemedText size="l" weight="bold" className="text-center" style={{ color: '#000' }}>
                {t('createRoom.createButton')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedScrollView> 
    </ThemedSafeAreaView>
   
  );
};

export default CreateRoomScreen;

