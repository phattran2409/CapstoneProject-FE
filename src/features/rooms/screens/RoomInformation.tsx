import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Animated, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
  ThemedCard 
} from '@/shared/components/themed';
import { RootStackParamList } from '@/app/navigation/types';
import { useRoomDetail, useJoinRoom, type Player } from '@/features/rooms';
import { useAuthStore } from '@/features/auth';
import SplashScreen from '@/features/splash/screens/SplashScreen';

type RoomInformationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomInformation'>;

interface RoomInformationScreenProps {
  navigation?: RoomInformationScreenNavigationProp;
  route?: {
    params: {
      roomId: string;
    };
  };
}

const RoomInformationScreen: React.FC<RoomInformationScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId } = route?.params || { roomId: '1' };
  
  // ✅ Use React Query hooks
  const { data: room, isLoading, error, refetch } = useRoomDetail(roomId);
  const { mutate: joinRoom, isPending: isJoining } = useJoinRoom();
  const { user } = useAuthStore();
  
  console.log('room', room);
  // ✅ Local UI state
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'host' | 'venue'>('teams');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // ✅ Handle join team
  const handleJoinTeam = (teamId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join a room');
      return;
    }

    joinRoom(
      { userId: user.id, roomId: room!.id, teamId },
      {
        onSuccess: () => {
          Alert.alert('Success', 'You have joined the team!');
          setSelectedTeamId(teamId);
          refetch();
        },
        onError: (error: any) => {
          Alert.alert('Error', error.message || 'Failed to join room');
        },
      }
    );
  };

  const handleJoinMatch = () => {
    if (!selectedTeamId) {
      Alert.alert('Please choose a team', 'You need to select a team before joining the match');
      return;
    }
    navigation?.navigate('RoomDetail', { roomId });
  };

  // ✅ Loading state
  if (isLoading) {
    return (
      <SplashScreen />
    );
  }

  // ✅ Error state
  if (error) {
    return (
      <ThemedSafeAreaView className='py-10'>
        <ThemedView className="flex-1 items-center justify-center p-5">
          <ThemedText variant="secondary" className="mb-4" style={{ color: '#ef4444' }}>{(error as any).message}</ThemedText>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-2xl py-3 px-6"
            style={{ backgroundColor: theme.colors.neonGreen }}
          >
            <ThemedText weight="bold" style={{ color: '#000' }}>Try Again</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedSafeAreaView>
    );
  }

  // ✅ Not found state
  if (!room) {
    return (
      <ThemedSafeAreaView className='py-10'>
        <ThemedView className="flex-1 items-center justify-center">
          <ThemedText>Room not found</ThemedText>
        </ThemedView>
      </ThemedSafeAreaView>
    );
  }

  const renderPlayerCard = (player: Player | null, teamId: string, teamColor: string) => {
    // ✅ Create animation value directly (not a hook, safe in render function)
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }).start();
    };

    if (!player) {
      // Empty slot - Interactive add button
      return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={() => handleJoinTeam(teamId)}
            disabled={isJoining}
          >
            <View
              className="items-center justify-center rounded-2xl"
              style={{ 
                width: 110,
                height: 140,
                borderWidth: 2,
                borderStyle: 'dashed',
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface + '80',
                opacity: isJoining ? 0.5 : 1,
              }}
            >
              <View 
                className="w-16 h-16 rounded-full items-center justify-center mb-2"
                style={{ 
                  backgroundColor: theme.colors.neonGreen + '20',
                }}
              >
                <ThemedIcon name={isJoining ? "hourglass" : "add"} size={32} variant="accent" />
              </View>
              <ThemedText variant="secondary" size="s" weight="medium">
                {isJoining ? 'Joining...' : t('roomDetail.emptySlot')}
              </ThemedText>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    }

    // Player card with beautiful background and effects
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={() => {
            console.log('View player profile:', player.user?.id);
            // Handle view player profile
          }}
        >
          <View
            className="items-center justify-center rounded-2xl overflow-hidden"
            style={{ 
              width: 110,
              height: 140,
              backgroundColor: theme.colors.surface,
              borderWidth: 2,
              borderColor: theme.colors.border,
              shadowColor: teamColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Gradient Background Effect */}
            <View 
              className="absolute top-0 left-0 right-0 h-16"
              style={{
                backgroundColor: teamColor + '15',
              }}
            />
            
            {/* Avatar with Glow Effect */}
            <View className="mt-3">
              <View 
                className="w-16 h-16 rounded-full overflow-hidden"
                style={{ 
                  borderWidth: 3,
                  borderColor: teamColor,
                  backgroundColor: theme.colors.background,
                  shadowColor: teamColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.6,
                  shadowRadius: 8,
                  elevation: 8,
                }}
              >
                {player.user?.avatar ? (
                  <Image
                    source={{ uri: player.user.avatar }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-full h-full items-center justify-center" style={{ backgroundColor: teamColor + '30' }}>
                    <ThemedIcon name="person" size={32} variant="accent" />
                  </View>
                )}
              </View>
              
              {/* Confirmed Badge */}
              {player.isConfirmed && (
                <View 
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full items-center justify-center"
                  style={{ 
                    backgroundColor: teamColor,
                    borderWidth: 2,
                    borderColor: theme.colors.surface,
                  }}
                >
                  <ThemedIcon name="checkmark" size={14} color="#000" />
                </View>
              )}
            </View>

            {/* Player Name with better contrast */}
            <View 
              className="mt-2 px-2 py-1 rounded-lg"
              style={{ 
                backgroundColor: theme.colors.background + '80',
              }}
            >
              <ThemedText 
                variant="secondary" 
                size="s" 
                weight="medium"
                className="text-center"
                numberOfLines={1}
                style={{ letterSpacing: 0.3 }}
              >
                {player.user?.name || 'Unknown'}
              </ThemedText>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
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
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t('roomDetail.title')}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Tab Navigation */}
      <View 
        className="flex-row px-5 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('teams')}
          className="flex-1 items-center py-3 rounded-xl mr-2"
          style={{ 
            backgroundColor: activeTab === 'teams' ? theme.colors.neonGreen + '20' : 'transparent',
          }}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'teams' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'teams' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Teams
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('host')}
          className="flex-1 items-center py-3 rounded-xl mr-2"
          style={{ 
            backgroundColor: activeTab === 'host' ? theme.colors.neonGreen + '20' : 'transparent',
          }}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'host' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'host' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Host Info
          </ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={() => setActiveTab('venue')}
          className="flex-1 items-center py-3 rounded-xl"
          style={{ 
            backgroundColor: activeTab === 'venue' ? theme.colors.neonGreen + '20' : 'transparent',
          }}
        >
          <ThemedText 
            size="m" 
            weight={activeTab === 'venue' ? 'bold' : 'medium'}
            style={{ color: activeTab === 'venue' ? theme.colors.neonGreen : theme.colors.textSecondary }}
          >
            Venue
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ThemedScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 py-6">
          {/* Teams Tab Content */}
          {activeTab === 'teams' && (
            <>
          {/* Room Info Section */}
          <View className="mb-6">
            {/* Format */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="people" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.format')}
                </ThemedText>
                <ThemedText variant="primary" size="xl" weight="bold">
                  {room.format}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Datetime */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl mb-3"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="time" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.datetime')}
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {new Date(room.datetime).toLocaleString('vi-VN')}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Venue */}
            <ThemedView 
              className="flex-row items-center px-4 py-4 rounded-2xl"
              style={{ backgroundColor: theme.colors.surface }}
            >
              <View 
                className="w-12 h-12 rounded-xl items-center justify-center mr-4"
                style={{ backgroundColor: theme.colors.neonGreen + '20' }}
              >
                <ThemedIcon name="location" size={24} variant="accent" />
              </View>
              <View className="flex-1">
                <ThemedText variant="secondary" size="xs" className="mb-1">
                  {t('roomDetail.venue')}
                </ThemedText>
                <ThemedText variant="primary" size="m" weight="medium">
                  {room.venue.name}
                </ThemedText>
                <ThemedText variant="secondary" size="s">
                  {room.venue.address}
                </ThemedText>
              </View>
            </ThemedView>
          </View>

          {/* Team Lineup Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <ThemedText variant="primary" size="l" weight="bold">
                {t('roomDetail.teamLineup')} ({room.currentPlayers}/{room.totalPlayers})
              </ThemedText>
            </View>

            {/* Render Teams from API */}
            {room.teams.map((team) => (
              <View key={team.id} className="mb-6">
                <View className="flex-row items-center gap-2 mb-3">
                  <ThemedIcon name="shield" size={20} variant="accent" />
                  <ThemedText variant="accent" size="m" weight="bold">
                    {team.name}
                  </ThemedText>
                  {selectedTeamId === team.id && (
                    <View 
                      className="px-2 py-1 rounded-lg"
                      style={{ backgroundColor: theme.colors.neonGreen + '30' }}
                    >
                      <ThemedText size="xs" weight="bold" style={{ color: theme.colors.neonGreen }}>
                        Your Team
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 12 }}
                >
                  {team.players.map((player, index) => (
                    <View key={`${team.id}-player-${index}`}>
                      {renderPlayerCard(player, team.id, team.color)}
                    </View>
                  ))}
                  {/* Add empty slot if team not full */}
                  {team.players.length < room.totalPlayers / 2 && (
                    <View key={`${team.id}-empty-slot`}>
                      {renderPlayerCard(null, team.id, team.color)}
                    </View>
                  )}
                </ScrollView>
              </View>
            ))}
          </View>
            </>
          )}

          {/* Host Info Tab Content */}
          {activeTab === 'host' && room.host && (
            <View>
              <ThemedText size="xl" weight="bold" className="mb-4">
                Host Information
              </ThemedText>
              
              <ThemedCard className="p-5 rounded-2xl">
                <View className="flex-row items-center mb-4">
                  <Image
                    source={{ uri: room.host.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(room.host.name) }}
                    className="w-20 h-20 rounded-full mr-4"
                  />
                  <View className="flex-1">
                    <ThemedText size="xl" weight="bold" className="mb-1">
                      {room.host.name}
                    </ThemedText>
                    <View className="flex-row items-center gap-2">
                      <ThemedIcon name="star" size={16} variant="accent" />
                      <ThemedText variant="secondary" size="m">
                        {(room.host as any).rating || 'N/A'} • {(room.host as any).matchesHosted || 0} matches hosted
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {(room.host as any).bio && (
                  <View className="mb-4">
                    <ThemedText variant="secondary" size="m">
                      {(room.host as any).bio}
                    </ThemedText>
                  </View>
                )}

                <View className="flex-row gap-3">
                  <View 
                    className="flex-1 p-3 rounded-xl"
                    style={{ backgroundColor: theme.colors.neonGreen + '10' }}
                  >
                    <ThemedText variant="secondary" size="xs" className="mb-1">
                      Email
                    </ThemedText>
                    <ThemedText size="s" weight="medium" numberOfLines={1}>
                      {room.host.email}
                    </ThemedText>
                  </View>
                  {room.host.phone && (
                    <View 
                      className="flex-1 p-3 rounded-xl"
                      style={{ backgroundColor: theme.colors.neonGreen + '10' }}
                    >
                      <ThemedText variant="secondary" size="xs" className="mb-1">
                        Phone
                      </ThemedText>
                      <ThemedText size="s" weight="medium">
                        {room.host.phone}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </ThemedCard>
            </View>
          )}

          {/* Venue Details Tab Content */}
          {activeTab === 'venue' && room.venue && (
            <View>
              <ThemedText size="xl" weight="bold" className="mb-4">
                Venue Details
              </ThemedText>

              {/* Venue Images Carousel */}
              {room.venue.images && room.venue.images.length > 0 && (
                <View className="mb-6">
                  <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                      const index = Math.round(e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width);
                      setSelectedImageIndex(index);
                    }}
                    scrollEventThrottle={16}
                  >
                    {room.venue.images.map((imageUrl, index) => (
                      <View key={index} style={{ width: 350, marginRight: 10 }}>
                        <Image
                          source={{ uri: imageUrl }}
                          style={{ 
                            width: '100%', 
                            height: 220, 
                            borderRadius: 16,
                          }}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                  {/* Image Indicators */}
                  <View className="flex-row justify-center mt-3 gap-2">
                    {room.venue.images.map((_, index) => (
                      <View
                        key={index}
                        style={{
                          width: selectedImageIndex === index ? 24 : 8,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: selectedImageIndex === index 
                            ? theme.colors.neonGreen 
                            : theme.colors.border,
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Venue Info Cards */}
              <View className="gap-3 mb-6">
                {/* Rating & Price */}
                <View className="flex-row gap-3">
                  <ThemedCard className="flex-1 p-4 rounded-2xl">
                    <View className="flex-row items-center mb-2">
                      <ThemedIcon name="star" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" className="ml-2">
                        Rating
                      </ThemedText>
                    </View>
                    <ThemedText size="xl" weight="bold">
                      {room.venue.rating}
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      {room.venue.totalReviews} reviews
                    </ThemedText>
                  </ThemedCard>

                  <ThemedCard className="flex-1 p-4 rounded-2xl">
                    <View className="flex-row items-center mb-2">
                      <ThemedIcon name="cash" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" className="ml-2">
                        Price/Hour
                      </ThemedText>
                    </View>
                    <ThemedText size="xl" weight="bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.venue.pricePerHour)}
                    </ThemedText>
                  </ThemedCard>
                </View>

                {/* Location */}
                <ThemedCard className="p-4 rounded-2xl">
                  <View className="flex-row items-center mb-2">
                    <ThemedIcon name="location" size={20} variant="accent" />
                    <ThemedText size="m" weight="bold" className="ml-2">
                      Location
                    </ThemedText>
                  </View>
                  <ThemedText variant="secondary" size="m">
                    {room.venue.address}
                  </ThemedText>
                  {room.venue.lat && room.venue.lng && (
                    <ThemedText variant="secondary" size="s" className="mt-1">
                      📍 {room.venue.lat.toFixed(4)}, {room.venue.lng.toFixed(4)}
                    </ThemedText>
                  )}
                </ThemedCard>

                {/* Amenities */}
                {room.venue.amenities && room.venue.amenities.length > 0 && (
                  <ThemedCard className="p-4 rounded-2xl">
                    <View className="flex-row items-center mb-3">
                      <ThemedIcon name="checkmark-circle" size={20} variant="accent" />
                      <ThemedText size="m" weight="bold" className="ml-2">
                        Amenities
                      </ThemedText>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {room.venue.amenities.map((amenity, index) => (
                        <View
                          key={index}
                          className="px-3 py-2 rounded-lg"
                          style={{ backgroundColor: theme.colors.neonGreen + '15' }}
                        >
                          <ThemedText size="s" weight="medium">
                            ✓ {amenity}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </ThemedCard>
                )}
              </View>
            </View>
          )}
        </View>
      </ThemedScrollView>

      {/* Join Button - Only show on Teams tab */}
      {activeTab === 'teams' && (
      <View 
        className="px-5 pb-6"
        style={{ 
          borderTopWidth: 1, 
          borderTopColor: theme.colors.border,
          backgroundColor: theme.colors.background,
        }}
      >
        <TouchableOpacity
          className="rounded-2xl py-4 mt-4"
          style={{
            backgroundColor: selectedTeamId ? theme.colors.neonGreen : theme.colors.border,
            shadowColor: selectedTeamId ? theme.colors.neonGreen : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={handleJoinMatch}
          disabled={!selectedTeamId || isJoining}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            className="text-center" 
            style={{ color: selectedTeamId ? '#000' : theme.colors.textSecondary }}
          >
            {isJoining 
              ? 'Joining...' 
              : selectedTeamId 
                ? t('roomDetail.joinButton') 
                : 'Choose a team first'
            }
          </ThemedText>
        </TouchableOpacity>
      </View>
      )}
    </ThemedSafeAreaView>
  );
};

export default RoomInformationScreen;

