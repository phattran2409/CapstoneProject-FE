import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';

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
    <SafeAreaView className="flex-1 bg-dark-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 border-b border-[#2a2a2a]">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-soft-white">
            {t('createRoom.title')}
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Match Format Selection */}
          <View className="mb-6">
            <Text className="text-soft-white text-base font-semibold mb-3">
              {t('createRoom.selectFormat')}
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl ${selectedFormat === '5vs5' ? 'bg-neon-green' : 'bg-[#2a2a2a]'}`}
                onPress={() => setSelectedFormat('5vs5')}
              >
                <Text className={`text-center text-lg font-bold ${selectedFormat === '5vs5' ? 'text-dark-black' : 'text-medium-gray'}`}>
                  5 vs 5
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl ${selectedFormat === '7vs7' ? 'bg-neon-green' : 'bg-[#2a2a2a]'}`}
                onPress={() => setSelectedFormat('7vs7')}
              >
                <Text className={`text-center text-lg font-bold ${selectedFormat === '7vs7' ? 'text-dark-black' : 'text-medium-gray'}`}>
                  7 vs 7
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Room Name */}
          <View className="mb-6">
            <Text className="text-soft-white text-base font-semibold mb-3">
              {t('createRoom.roomName')}
            </Text>
            <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a]">
              <TextInput
                className="text-soft-white text-base"
                placeholder="Nhập tên phòng đấu"
                placeholderTextColor={theme.colors.textSecondary}
                value={roomName}
                onChangeText={setRoomName}
              />
            </View>
          </View>

          {/* Venue Selection */}
          <View className="mb-6">
            <Text className="text-soft-white text-base font-semibold mb-3">
              {t('createRoom.venue')}
            </Text>
            <TouchableOpacity
              className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a] flex-row items-center justify-between"
              onPress={() => navigation?.navigate('VenueSelection')}
            >
              {selectedVenue ? (
                <View className="flex-1">
                  <Text className="text-soft-white text-base font-semibold">
                    {selectedVenue.name}
                  </Text>
                  <Text className="text-medium-gray text-sm mt-1">
                    {selectedVenue.address}
                  </Text>
                </View>
              ) : (
                <Text className="text-medium-gray text-base flex-1">
                  {t('createRoom.venuePlaceholder')}
                </Text>
              )}
              <Ionicons name="location" size={24} color={theme.colors.neonGreen} />
            </TouchableOpacity>
          </View>

          {/* Date and Time */}
          <View className="flex-row gap-3 mb-6">
            {/* Date */}
            <View className="flex-1">
              <Text className="text-soft-white text-base font-semibold mb-3">
                {t('createRoom.matchDate')}
              </Text>
              <TouchableOpacity
                className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a] flex-row items-center justify-between"
                onPress={() => setShowDatePicker(true)}
              >
                <Text className="text-soft-white text-base">
                  {formatDate(matchDate)}
                </Text>
                <Ionicons name="calendar" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Time */}
            <View className="flex-1">
              <Text className="text-soft-white text-base font-semibold mb-3">
                {t('createRoom.matchTime')}
              </Text>
              <TouchableOpacity
                className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a] flex-row items-center justify-between"
                onPress={() => setShowTimePicker(true)}
              >
                <Text className="text-soft-white text-base">
                  {formatTime(matchTime)}
                </Text>
                <Ionicons name="time" size={20} color={theme.colors.textSecondary} />
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
            <Text className="text-soft-white text-base font-semibold mb-3">
              {t('createRoom.roomSettings')}
            </Text>
            <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a] flex-row items-center justify-between">
              <Text className="text-soft-white text-base">
                {t('createRoom.privateRoom')}
              </Text>
              <Switch
                value={isPrivate}
                onValueChange={setIsPrivate}
                trackColor={{ false: '#2a2a2a', true: theme.colors.neonGreen }}
                thumbColor={isPrivate ? '#000' : '#f4f3f4'}
              />
            </View>
          </View>

          {/* Password (if private) */}
          {isPrivate && (
            <View className="mb-6">
              <Text className="text-soft-white text-base font-semibold mb-3">
                {t('createRoom.password')}
              </Text>
              <View className="bg-[#1a1a1a] rounded-2xl px-4 py-4 border border-[#2a2a2a] flex-row items-center">
                <TextInput
                  className="flex-1 text-soft-white text-base"
                  placeholder={t('createRoom.passwordPlaceholder')}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={theme.colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Create Button */}
          <TouchableOpacity
            className="bg-neon-green rounded-2xl py-4 mt-4"
            style={{
              shadowColor: theme.colors.neonGreen,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={handleCreateRoom}
          >
            <Text className="text-dark-black text-lg font-bold text-center">
              {t('createRoom.createButton')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateRoomScreen;

