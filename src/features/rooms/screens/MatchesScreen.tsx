import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ThemedSafeAreaView, ThemedText, ThemedView } from '@/shared/components/themed';
import { MatchList, MatchDetailModal, MatchItemData } from '@/shared/components';
import { useScrollToHideTabBar } from '@/shared/hooks/useScrollToHideTabBar';
import { RootStackParamList, TabParamList } from '@/app/navigation/types';
import { ActiveRoomBannerV2 } from '@/shared/components/ActiveRoomBannerV2';

type MatchesScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Matches'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface MatchesScreenProps {
  navigation: MatchesScreenNavigationProp;
}

const MatchesScreen: React.FC<MatchesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const scrollHandler = useScrollToHideTabBar();
  const [selectedMatch, setSelectedMatch] = useState<MatchItemData | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Mock data - replace with real data from API
  const ongoingMatches: MatchItemData[] = [
    {
      id: '1',
      title: 'Giao hữu cuối tuần',
      format: '5vs5',
      players: '7/10',
      image: require('@assets/images/icon.png'),
      status: 'ongoing',
    },
    {
      id: '2',
      title: 'Team Anh Em',
      format: '7vs7',
      players: '12/14',
      image: require('@assets/images/icon.png'),
      status: 'ongoing',
    },
  ];

  const recentMatches: MatchItemData[] = [
    {
      id: '1',
      title: 'Giao hữu cuối tuần',
      date: '18/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '5vs5',
      players: '10/10',
    },
    {
      id: '4',
      title: 'Team Anh Em',
      date: '15/07/2024',
      status: 'lose',
      image: require('@assets/images/icon.png'),
      format: '7vs7',
      players: '14/14',
    },
    {
      id: '5',
      title: 'Đá cho vui',
      date: '12/07/2024',
      status: 'draw',
      image: require('@assets/images/icon.png'),
      format: '6vs6',
      players: '12/12',
    },
    {
      id: '6',
      title: 'Trận đấu cuối tuần',
      date: '10/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '5vs5',
      players: '10/10',
    },
    {
      id: '7',
      title: 'Giao hữu thân thiện',
      date: '08/07/2024',
      status: 'draw',
      image: require('@assets/images/icon.png'),
      format: '7vs7',
      players: '14/14',
    },
    {
      id: '8',
      title: 'Championship',
      date: '05/07/2024',
      status: 'win',
      image: require('@assets/images/icon.png'),
      format: '11vs11',
      players: '22/22',
    },
  ];

  const handleMatchPress = (matchId: string) => {
    const match = [...ongoingMatches, ...recentMatches].find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      setModalVisible(true);
    }
  };

  const handleViewDetail = (matchId: string) => {
    navigation.navigate('RoomInformation', { roomId: matchId });
  };

  return (
    <ThemedSafeAreaView>
      {/* Header */}
      <ThemedView
        style={[
          styles.header,
          {
            paddingHorizontal: theme.spacing.l,
            paddingVertical: theme.spacing.m,
            marginTop: theme.spacing.xl,
          },
        ]}
      >
        <ThemedText size="xxl" weight="bold" variant="primary">
          {t("matches.title", "Trận đấu")}
        </ThemedText>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="search"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons
              name="filter"
              size={24}
              color={theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Active Room Banner - Chỉ hiển thị khi có active room */}
      <ActiveRoomBannerV2 />

      <ScrollView 
        style={styles.flex1}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        nestedScrollEnabled={true}
      >
        {/* Ongoing Matches Section */}
        <MatchList
          matches={ongoingMatches}
          title={t("home.RecommendMatches")}
          variant="horizontal"
          itemVariant="card"
          onMatchPress={handleMatchPress}
          showStatus={true}
        />

        {/* Recent Matches Section */}
        <MatchList
          matches={recentMatches}
          title={t("home.recentMatches", "Trận đấu gần đây")}
          variant="vertical"
          itemVariant="list"
          onMatchPress={handleMatchPress}
          showStatus={true}
          containerStyle={{ marginBottom: theme.spacing.xxl * 2 }}
        />
      </ScrollView>

      {/* Floating Create Button */}
      <TouchableOpacity
        style={[
          styles.createButton,
          {
            backgroundColor: theme.colors.neonGreen,
            shadowColor: theme.colors.neonGreen,
            borderRadius: theme.radius.l,
            paddingVertical: theme.spacing.m,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            marginHorizontal: theme.spacing.l,
            marginBottom: theme.spacing.l,
          },
        ]}
        onPress={() => {
          navigation.navigate("CreateRoom");
        }}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
        <ThemedText
          size="l"
          weight="bold"
          style={{ marginLeft: 8, color: theme.colors.background }}
        >
          {t("home.createNewRoom", "Tạo phòng mới")}
        </ThemedText>
      </TouchableOpacity>

      {/* Match Detail Modal */}
      <MatchDetailModal
        visible={modalVisible}
        match={selectedMatch}
        onClose={() => {
          setModalVisible(false);
          setSelectedMatch(null);
        }}
        onViewDetail={handleViewDetail}
      />
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButton: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default MatchesScreen;
