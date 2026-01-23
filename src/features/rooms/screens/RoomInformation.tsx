import React, { useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView, Alert, StyleSheet, Share } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
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
import { useRoomDetail, useJoinRoom, useKickPlayer, useCancelRoom, type Player } from '@/features/rooms';
import { useAuthStore } from '@/features/auth';
import SplashScreen from '@/features/splash/screens/SplashScreen';
import Ionicons from '@expo/vector-icons/Ionicons';
import { HostMenuModal, PlayerCard } from '../components';

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
  const nav = useNavigation<RoomInformationScreenNavigationProp>();
  
  // ✅ Handle back navigation (supports deep link)
  const handleGoBack = () => {
    // Check if there's a previous screen in the stack
    if (navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      // No stack (came from deep link), navigate to MainTabs
      nav.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };
  
  // ✅ Use React Query hooks
  const { data: room, isLoading, error, refetch } = useRoomDetail(roomId);
  const { mutate: joinRoom, isPending: isJoining } = useJoinRoom();
  const { mutate: kickPlayer, isPending: isKicking } = useKickPlayer();
  const { mutate: cancelRoom, isPending: isCancelling } = useCancelRoom();

  const { user } = useAuthStore();
  
  console.log('room', room);
  
  // ✅ Check if user is the host
  const isHost = room?.hostId === user?.userId;
  console.log('isHost', user?.userId);
  // ✅ Local UI state
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'host' | 'venue'>('teams');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showMenuModal, setShowMenuModal] = useState(false);

  // ✅ Handle join team
  const handleJoinTeam = (teamId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to join a room');
      return;
    }

    joinRoom(
      { userId: user.userId, roomId: room!.id, teamId },
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

  // ✅ Handle kick player (host only)
  const handleKickPlayer = (userId: string, playerName: string) => {
    Alert.alert(
      'Kick Player',
      `Are you sure you want to kick ${playerName} from the room?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Kick',
          style: 'destructive',
          onPress: () => {
            kickPlayer(
              { roomId, playerId: userId },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Player has been kicked from the room');
                  refetch();
                },
                onError: (error: any) => {
                  Alert.alert('Error', error.message || 'Failed to kick player');
                },
              }
            );
          },
        },
      ]
    );
  };

  // ✅ Handle cancel room (host only)
  const handleCancelRoom = () => {
    Alert.alert(
      'Cancel Room',
      'Are you sure you want to cancel this room? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            cancelRoom(roomId, {
              onSuccess: () => {
                Alert.alert('Success', 'Room has been cancelled');
                navigation?.goBack();
              },
              onError: (error: any) => {
                Alert.alert('Error', error.message || 'Failed to cancel room');
              },
            });
          },
        },
      ]
    );
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
      <ThemedSafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.errorContainer}>
          <ThemedText variant="secondary" style={[styles.errorText, { color: '#ef4444' }]}>
            {(error as any).message}
          </ThemedText>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: theme.colors.neonGreen }]}
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
      <ThemedSafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.notFoundContainer}>
          <ThemedText>Room not found</ThemedText>
        </ThemedView>
      </ThemedSafeAreaView>
    );
  }


  return (
    <ThemedSafeAreaView style={styles.safeArea}>
      {/* Header */}
      <ThemedView 
        style={[
          styles.header,
          { borderBottomColor: theme.colors.border }
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <ThemedIcon name="arrow-back" size={24} variant="secondary" />
          </TouchableOpacity>
          <ThemedText size="xl" weight="bold">
            {t('roomDetail.title')}
          </ThemedText>
        </View>
        
        {/* Menu Button (Host only) */}
        {isHost && (
          <TouchableOpacity
            onPress={() => setShowMenuModal(true)}
            style={styles.menuButton}
          >
            <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Tab Navigation */}
      <View 
        style={[
          styles.tabContainer,
          { borderBottomColor: theme.colors.border }
        ]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('teams')}
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'teams' ? theme.colors.neonGreen + '20' : 'transparent',
              marginRight: 8,
            }
          ]}
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
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'host' ? theme.colors.neonGreen + '20' : 'transparent',
              marginRight: 8,
            }
          ]}
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
          style={[
            styles.tabButton,
            { 
              backgroundColor: activeTab === 'venue' ? theme.colors.neonGreen + '20' : 'transparent',
            }
          ]}
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
        <View style={styles.contentContainer}>
          {/* Teams Tab Content */}
          {activeTab === 'teams' && (
            <>
          {/* Room Info Section */}
          <View style={styles.roomInfoSection}>
            {/* Format */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="people" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  {t('roomDetail.format')}
                </ThemedText>
                <ThemedText variant="primary" size="xl" weight="bold">
                  {room.format}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Datetime */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="time" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
                  {t('roomDetail.datetime')}
                </ThemedText>
                <ThemedText variant="primary" size="l" weight="semiBold">
                  {new Date(room.datetime).toLocaleString('vi-VN')}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Venue */}
            <ThemedView 
              style={[
                styles.infoCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              <View 
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: theme.colors.neonGreen + '20' }
                ]}
              >
                <ThemedIcon name="location" size={24} variant="accent" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText variant="secondary" size="xs" style={styles.infoLabel}>
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
          <View style={styles.teamLineupSection}>
            <View style={styles.teamLineupHeader}>
              <ThemedText variant="primary" size="l" weight="bold">
                {t('roomDetail.teamLineup')} ({room.currentPlayers}/{room.totalPlayers})
              </ThemedText>
            </View>

            {/* Render Teams from API */}
            {room.teams.map((team) => (
              <View key={team.id} style={styles.teamContainer}>
                <View style={styles.teamHeader}>
                  <ThemedIcon name="shield" size={20} variant="accent" />
                  <ThemedText variant="accent" size="m" weight="bold" style={styles.teamName}>
                    {team.name}
                  </ThemedText>
                  {selectedTeamId === team.id && (
                    <View 
                      style={[
                        styles.selectedTeamBadge,
                        { backgroundColor: theme.colors.neonGreen + '30' }
                      ]}
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
                  contentContainerStyle={styles.playersScrollContainer}
                >
                  {team.players.map((player, index) => (
                    <View key={`${team.id}-player-${index}`}>
                      <PlayerCard
                        player={player}
                        teamId={team.id}
                        teamColor={team.color}
                        isHost={isHost}
                        currentUserId={user?.userId}
                        isJoining={isJoining}
                        isKicking={isKicking}
                        onJoinTeam={handleJoinTeam}
                        onKickPlayer={handleKickPlayer}
                        onPress={() => {
                          console.log('View player profile:', player.user?.id);
                          // Handle view player profile
                        }}
                      />
                    </View>
                  ))}
                  {/* Add empty slot if team not full */}
                  {team.players.length < room.totalPlayers / 2 && (
                    <View key={`${team.id}-empty-slot`}>
                      <PlayerCard
                        player={null}
                        teamId={team.id}
                        teamColor={team.color}
                        isHost={isHost}
                        currentUserId={user?.userId}
                        isJoining={isJoining}
                        isKicking={isKicking}
                        onJoinTeam={handleJoinTeam}
                        onKickPlayer={handleKickPlayer}
                      />
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
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Host Information
              </ThemedText>
              
              <ThemedCard style={styles.hostCard}>
                <View style={styles.hostHeader}>
                  <Image
                    source={{ uri: room.host.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(room.host.name) }}
                    style={styles.hostAvatar}
                  />
                  <View style={styles.hostInfo}>
                    <ThemedText size="xl" weight="bold" style={styles.hostName}>
                      {room.host.name}
                    </ThemedText>
                    <View style={styles.hostRating}>
                      <ThemedIcon name="star" size={16} variant="accent" />
                      <ThemedText variant="secondary" size="m" style={styles.hostRatingText}>
                        {(room.host as any).rating || 'N/A'} • {(room.host as any).matchesHosted || 0} matches hosted
                      </ThemedText>
                    </View>
                  </View>
                </View>

                {(room.host as any).bio && (
                  <View style={styles.hostBio}>
                    <ThemedText variant="secondary" size="m">
                      {(room.host as any).bio}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.hostContact}>
                  <View 
                    style={[
                      styles.hostContactItem,
                      { backgroundColor: theme.colors.neonGreen + '10' }
                    ]}
                  >
                    <ThemedText variant="secondary" size="xs" style={styles.contactLabel}>
                      Email
                    </ThemedText>
                    <ThemedText size="s" weight="medium" numberOfLines={1}>
                      {room.host.email}
                    </ThemedText>
                  </View>
                  {room.host.phone && (
                    <View 
                      style={[
                        styles.hostContactItem,
                        { backgroundColor: theme.colors.neonGreen + '10' }
                      ]}
                    >
                      <ThemedText variant="secondary" size="xs" style={styles.contactLabel}>
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
              <ThemedText size="xl" weight="bold" style={styles.sectionTitle}>
                Venue Details
              </ThemedText>

              {/* Venue Images Carousel */}
              {room.venue.images && room.venue.images.length > 0 && (
                <View style={styles.venueImagesContainer}>
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
                      <View key={index} style={styles.venueImageWrapper}>
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.venueImage}
                          resizeMode="cover"
                        />
                      </View>
                    ))}
                  </ScrollView>
                  {/* Image Indicators */}
                  <View style={styles.imageIndicators}>
                    {room.venue.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.imageIndicator,
                          {
                            width: selectedImageIndex === index ? 24 : 8,
                            backgroundColor: selectedImageIndex === index 
                              ? theme.colors.neonGreen 
                              : theme.colors.border,
                          }
                        ]}
                      />
                    ))}
                  </View>
                </View>
              )}

              {/* Venue Info Cards */}
              <View style={styles.venueInfoContainer}>
                {/* Rating & Price */}
                <View style={styles.venueInfoRow}>
                  <ThemedCard style={styles.venueInfoCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="star" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" style={styles.venueInfoLabel}>
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

                  <ThemedCard style={styles.venueInfoCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="cash" size={20} variant="accent" />
                      <ThemedText size="xs" variant="secondary" style={styles.venueInfoLabel}>
                        Price/Hour
                      </ThemedText>
                    </View>
                    <ThemedText size="xl" weight="bold">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(room.venue.pricePerHour)}
                    </ThemedText>
                  </ThemedCard>
                </View>

                {/* Location */}
                <ThemedCard style={styles.venueLocationCard}>
                  <View style={styles.venueInfoHeader}>
                    <ThemedIcon name="location" size={20} variant="accent" />
                    <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                      Location
                    </ThemedText>
                  </View>
                  <ThemedText variant="secondary" size="m">
                    {room.venue.address}
                  </ThemedText>
                  {room.venue.lat && room.venue.lng && (
                    <ThemedText variant="secondary" size="s" style={styles.venueCoordinates}>
                      📍 {room.venue.lat.toFixed(4)}, {room.venue.lng.toFixed(4)}
                    </ThemedText>
                  )}
                </ThemedCard>

                {/* Amenities */}
                {room.venue.amenities && room.venue.amenities.length > 0 && (
                  <ThemedCard style={styles.venueAmenitiesCard}>
                    <View style={styles.venueInfoHeader}>
                      <ThemedIcon name="checkmark-circle" size={20} variant="accent" />
                      <ThemedText size="m" weight="bold" style={styles.venueInfoLabel}>
                        Amenities
                      </ThemedText>
                    </View>
                    <View style={styles.amenitiesContainer}>
                      {room.venue.amenities.map((amenity, index) => (
                        <View
                          key={index}
                          style={[
                            styles.amenityTag,
                            { backgroundColor: theme.colors.neonGreen + '15' }
                          ]}
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

      {/* Host Menu Modal */}
      {isHost && (
        <HostMenuModal
          visible={showMenuModal}
          handleShowMenuModal={() => setShowMenuModal(false)}
          room={room}
          handleCancelRoom={handleCancelRoom}
          isCancelling={isCancelling}
        />
      )}
      {/* Join Button - Only show on Teams tab */}
      {activeTab === 'teams' && (
      <View 
        style={[
          styles.joinButtonContainer,
          { 
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.joinButton,
            {
              backgroundColor: selectedTeamId ? theme.colors.neonGreen : theme.colors.border,
              shadowColor: selectedTeamId ? theme.colors.neonGreen : 'transparent',
            }
          ]}
          onPress={handleJoinMatch}
          disabled={!selectedTeamId || isJoining}
        >
          <ThemedText 
            size="l" 
            weight="bold" 
            style={[
              styles.joinButtonText,
              { color: selectedTeamId ? '#000' : theme.colors.textSecondary }
            ]}
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

const styles = StyleSheet.create({
  safeArea: {
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    marginBottom: 16,
  },
  retryButton: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  roomInfoSection: {
    marginBottom: 24,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    marginBottom: 4,
  },
  teamLineupSection: {
    marginBottom: 24,
  },
  teamLineupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamContainer: {
    marginBottom: 24,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  teamName: {
    marginLeft: 4,
  },
  selectedTeamBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  playersScrollContainer: {
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  hostCard: {
    padding: 20,
    borderRadius: 16,
  },
  hostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  hostInfo: {
    flex: 1,
  },
  hostName: {
    marginBottom: 4,
  },
  hostRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hostRatingText: {
    marginLeft: 4,
  },
  hostBio: {
    marginBottom: 16,
  },
  hostContact: {
    flexDirection: 'row',
    gap: 12,
  },
  hostContactItem: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  contactLabel: {
    marginBottom: 4,
  },
  venueImagesContainer: {
    marginBottom: 24,
  },
  venueImageWrapper: {
    width: 350,
    marginRight: 10,
  },
  venueImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
  },
  imageIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  imageIndicator: {
    height: 8,
    borderRadius: 4,
  },
  venueInfoContainer: {
    gap: 12,
    marginBottom: 24,
  },
  venueInfoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  venueInfoCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
  },
  venueInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  venueInfoLabel: {
    marginLeft: 8,
  },
  venueLocationCard: {
    padding: 16,
    borderRadius: 16,
  },
  venueCoordinates: {
    marginTop: 4,
  },
  venueAmenitiesCard: {
    padding: 16,
    borderRadius: 16,
  },
  amenitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  joinButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderTopWidth: 1,
  },
  joinButton: {
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  joinButtonText: {
    textAlign: 'center',
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RoomInformationScreen;
