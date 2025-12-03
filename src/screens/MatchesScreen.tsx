import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedCard, ThemedSafeAreaView, ThemedText, ThemedView } from '@/components/themed';

type RootStackParamList = {
  Matches: undefined;
  Profile: undefined;
  MatchDetail: { matchId: string };
  CreateRoom: undefined;
  RoomDetail: { roomId: string };
};

type MatchesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Matches'>;

interface MatchesScreenProps {
  navigation: MatchesScreenNavigationProp;
}

interface Match {
  id: string;
  title: string;
  format: string;
  players: string;
  image: any;
  date?: string;
  status?: 'win' | 'lose' | 'draw';
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Mock data - replace with real data from API
  const ongoingMatches: Match[] = [
    {
      id: '1',
      title: 'Giao hữu cuối tuần',
      format: '5vs5',
      players: '7/10',
      image: require('../../assets/icon.png'), // Replace with actual match images
    },
    {
      id: '2',
      title: 'Team Anh Em',
      format: '7vs7',
      players: '12/14',
      image: require('../../assets/icon.png'), // Replace with actual match images
    },
  ];

  const recentMatches: Match[] = [
    {
      id: '3',
      title: 'Giao hữu cuối tuần',
      date: '18/07/2024',
      status: 'win',
      image: require('../../assets/icon.png'),
      format: '5vs5',
      players: '10/10',
    },
    {
      id: '4',
      title: 'Team Anh Em',
      date: '15/07/2024',
      status: 'lose',
      image: require('../../assets/icon.png'),
      format: '7vs7',
      players: '14/14',
    },
    {
      id: '5',
      title: 'Đá cho vui',
      date: '12/07/2024',
      status: 'draw',
      image: require('../../assets/icon.png'),
      format: '6vs6',
      players: '12/12',
    },
  ];

  const getStatusIcon = (status?: 'win' | 'lose' | 'draw') => {
    switch (status) {
      case 'win':
        return <Ionicons name="trophy" size={24} color={theme.colors.neonGreen} />;
      case 'lose':
        return <Ionicons name="sad-outline" size={24} color="#ef4444" />;
      case 'draw':
        return <Ionicons name="git-compare-outline" size={24} color="#6b7280" />;
      default:
        return null;
    }
  };

  const getStatusText = (status?: 'win' | 'lose' | 'draw') => {
    if (!status) return '';
    return t(`home.matchStatus.${status}`);
  };

  return (
    <ThemedSafeAreaView className="flex-1 py-10">
      {/* Header */}
      <ThemedView className="flex-row justify-between items-center px-5 py-4">
          <ThemedText size="xl" weight="bold"  variant="secondary" >
          {t('matches.title', 'Trận đấu')}
        </ThemedText>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="search" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="filter" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ongoing Matches Section */}
        <ThemedView className="mb-8">
          <ThemedText size="xl" weight="bold" className="px-5 mb-4">
            {t('home.ongoingMatches')}
          </ThemedText>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            className="gap-4"
          >
            {ongoingMatches.map((match, index) => (
              <ThemedCard key={match.id} padding={0}  variant="outlined" className="rounded-3xl overflow-hidden mr-4 border-1 border-[#2a2a2a]" >
                <TouchableOpacity
                  key={match.id}
                  className="overflow-hidden bg-transparent"
                  style={{ width: 280 }}
                  onPress={() => {
                    navigation.navigate('RoomDetail', { roomId: match.id });
                  }}
                >
                  <Image
                    source={match.image}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <ThemedView className="p-4 bg-transparent">
                    <ThemedText size="l" weight="bold" className="mb-2">
                      {match.title}
                    </ThemedText>
                    <ThemedText variant="secondary" size="s">
                      {match.format} - ({match.players})
                    </ThemedText>
                  </ThemedView>
                </TouchableOpacity>
              </ThemedCard>
            ))}
          </ScrollView>
        </ThemedView>

        {/* Recent Matches Section */}
        <ThemedView className="px-5 mb-24">
          <ThemedText size="xl" weight="bold" className="mb-4">
            {t('home.recentMatches')}
          </ThemedText>
          <View className="gap-3">
            {recentMatches.map((match) => (
              
              <TouchableOpacity
                key={match.id}
                className="rounded-2xl p-3 flex-row items-center"
                onPress={() => {
                  navigation.navigate('RoomDetail', { roomId: match.id });
                }}
              >
                <Image
                  source={match.image}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-4">
                  <ThemedText size="m" weight="semiBold" className="mb-1">
                    {match.title}
                  </ThemedText>
                  <ThemedText variant="secondary" size="s">
                    {match.date} - {getStatusText(match.status)}
                  </ThemedText>
                </View>
                <View>
                  {getStatusIcon(match.status)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ThemedView>
      </ScrollView>

      {/* Floating Create Button */}
      <ThemedView className="absolute bottom-0 left-0 right-0 px-5 pb-8 bg-gradient-to-t from-dark-black to-transparent">
        <TouchableOpacity
          className="rounded-2xl py-4 flex-row items-center justify-center"
          style={{
            backgroundColor: theme.colors.neonGreen,
            shadowColor: theme.colors.neonGreen,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
          onPress={() => {
            navigation.navigate('CreateRoom');
          }}
        >
          <Ionicons name="add" size={24} color={theme.colors.background} />
          <ThemedText 
            size="l" 
            weight="bold" 
            className="ml-2"
            style={{ color: theme.colors.background }}
          >
            {t('home.createNewRoom')}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedSafeAreaView>
    
  );
};

export default MatchesScreen;

