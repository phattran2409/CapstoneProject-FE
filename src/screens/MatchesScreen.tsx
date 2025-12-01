import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
  Matches: undefined;
  Profile: undefined;
  MatchDetail: { matchId: string };
  CreateRoom: undefined;
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
    <SafeAreaView className="flex-1 bg-dark-black">
      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4">
        <Text className="text-3xl font-bold text-soft-white">
          {t('matches.title', 'Trận đấu')}
        </Text>
        <View className="flex-row items-center gap-4">
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="search" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity className="w-10 h-10 items-center justify-center">
            <Ionicons name="filter" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Ongoing Matches Section */}
        <View className="mb-8">
          <Text className="text-xl font-bold text-soft-white px-5 mb-4">
            {t('home.ongoingMatches')}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            className="gap-4"
          >
            {ongoingMatches.map((match, index) => (
              <TouchableOpacity
                key={match.id}
                className="bg-[#1a1a1a] rounded-3xl overflow-hidden mr-4"
                style={{ width: 280 }}
                onPress={() => {
                  // navigation.navigate('MatchDetail', { matchId: match.id });
                }}
              >
                <Image
                  source={match.image}
                  className="w-full h-40"
                  resizeMode="cover"
                />
                <View className="p-4">
                  <Text className="text-soft-white text-lg font-bold mb-2">
                    {match.title}
                  </Text>
                  <Text className="text-medium-gray text-sm">
                    {match.format} - ({match.players})
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Matches Section */}
        <View className="px-5 mb-24">
          <Text className="text-xl font-bold text-soft-white mb-4">
            {t('home.recentMatches')}
          </Text>
          <View className="gap-3">
            {recentMatches.map((match) => (
              <TouchableOpacity
                key={match.id}
                className="bg-[#1a1a1a] rounded-2xl p-3 flex-row items-center"
                onPress={() => {
                  // navigation.navigate('MatchDetail', { matchId: match.id });
                }}
              >
                <Image
                  source={match.image}
                  className="w-20 h-20 rounded-xl"
                  resizeMode="cover"
                />
                <View className="flex-1 ml-4">
                  <Text className="text-soft-white text-base font-semibold mb-1">
                    {match.title}
                  </Text>
                  <Text className="text-medium-gray text-sm">
                    {match.date} - {getStatusText(match.status)}
                  </Text>
                </View>
                <View>
                  {getStatusIcon(match.status)}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Floating Create Button */}
      <View className="absolute bottom-0 left-0 right-0 px-5 pb-8 bg-gradient-to-t from-dark-black to-transparent">
        <TouchableOpacity
          className="bg-neon-green rounded-2xl py-4 flex-row items-center justify-center"
          style={{
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
          <Ionicons name="add" size={24} color="#000" />
          <Text className="text-dark-black text-lg font-bold ml-2">
            {t('home.createNewRoom')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default MatchesScreen;

