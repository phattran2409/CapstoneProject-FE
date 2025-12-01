import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';

type RootStackParamList = {
  CreateRoom: {
    selectedVenue: Venue;
  };
  VenueSelection: undefined;
};

type VenueSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VenueSelection'>;

interface VenueSelectionScreenProps {
  navigation?: VenueSelectionScreenNavigationProp;
}

interface Venue {
  id: string;
  name: string;
  address: string;
  district: string;
  price: number;
  rating: number;
  reviews: number;
  image: any;
  facilities: string[];
  availableFormats: string[];
  distance?: number;
}

const VenueSelectionScreen: React.FC<VenueSelectionScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5vs5' | '7vs7'>('all');

  // Mock data - replace with real data from API
  const venues: Venue[] = [
    {
      id: '1',
      name: 'Sân bóng Thảo Điền',
      address: '123 Đường Xuân Thủy, Thảo Điền',
      district: 'Quận 2',
      price: 500000,
      rating: 4.8,
      reviews: 245,
      image: require('../../assets/icon.png'),
      facilities: ['Parking', 'Shower', 'Locker'],
      availableFormats: ['5vs5', '7vs7'],
      distance: 2.5,
    },
    {
      id: '2',
      name: 'Sân Bình Thạnh FC',
      address: '456 Điện Biên Phủ',
      district: 'Bình Thạnh',
      price: 400000,
      rating: 4.6,
      reviews: 189,
      image: require('../../assets/icon.png'),
      facilities: ['Parking', 'Canteen'],
      availableFormats: ['5vs5'],
      distance: 3.2,
    },
    {
      id: '3',
      name: 'Sân Long Biên Sports',
      address: '789 Võ Văn Ngân',
      district: 'Thủ Đức',
      price: 450000,
      rating: 4.7,
      reviews: 312,
      image: require('../../assets/icon.png'),
      facilities: ['Parking', 'Shower', 'Locker', 'Canteen'],
      availableFormats: ['5vs5', '7vs7'],
      distance: 4.1,
    },
    {
      id: '4',
      name: 'Sân Phú Nhuận Arena',
      address: '321 Phan Đăng Lưu',
      district: 'Phú Nhuận',
      price: 550000,
      rating: 4.9,
      reviews: 428,
      image: require('../../assets/icon.png'),
      facilities: ['Parking', 'Shower', 'Locker', 'Canteen', 'Referee'],
      availableFormats: ['5vs5', '7vs7'],
      distance: 1.8,
    },
    {
      id: '5',
      name: 'Sân Tân Bình Center',
      address: '654 Cộng Hòa',
      district: 'Tân Bình',
      price: 380000,
      rating: 4.5,
      reviews: 156,
      image: require('../../assets/icon.png'),
      facilities: ['Parking', 'Shower'],
      availableFormats: ['5vs5'],
      distance: 5.3,
    },
  ];

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         venue.district.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || venue.availableFormats.includes(selectedFilter);
    
    return matchesSearch && matchesFilter;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSelectVenue = (venue: Venue) => {
    navigation?.navigate('CreateRoom', { selectedVenue: venue });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark-black">
      {/* Header */}
      <View className="px-5 py-4 border-b border-[#2a2a2a]">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
          </TouchableOpacity>
            <View className="flex-row items-center gap-2">
              <Ionicons name="location" size={28} color={theme.colors.neonGreen} />
              <Text className="text-2xl font-bold text-soft-white">
                {t('venueSelection.title')}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View className="bg-[#1a1a1a] rounded-xl px-4 py-3 flex-row items-center mb-4">
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            className="flex-1 ml-2 text-soft-white"
            placeholder={t('venueSelection.searchPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Format Filter */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${selectedFilter === 'all' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedFilter('all')}
          >
            <Text className={`font-semibold ${selectedFilter === 'all' ? 'text-dark-black' : 'text-medium-gray'}`}>
              {t('venueSelection.allFormats')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${selectedFilter === '5vs5' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedFilter('5vs5')}
          >
            <Text className={`font-semibold ${selectedFilter === '5vs5' ? 'text-dark-black' : 'text-medium-gray'}`}>
              5 vs 5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl ${selectedFilter === '7vs7' ? 'bg-neon-green' : 'bg-[#1a1a1a]'}`}
            onPress={() => setSelectedFilter('7vs7')}
          >
            <Text className={`font-semibold ${selectedFilter === '7vs7' ? 'text-dark-black' : 'text-medium-gray'}`}>
              7 vs 7
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Venues List */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 py-4">
          {filteredVenues.map((venue) => (
            <TouchableOpacity
              key={venue.id}
              className="bg-[#1a1a1a] rounded-2xl mb-4 overflow-hidden border border-[#2a2a2a]"
              onPress={() => handleSelectVenue(venue)}
            >
              {/* Venue Image */}
              <Image
                source={venue.image}
                className="w-full h-48"
                resizeMode="cover"
              />

              <View className="p-4">
                {/* Venue Name and Rating */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-1">
                    <Text className="text-soft-white text-lg font-bold mb-1">
                      {venue.name}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                      <Text className="text-medium-gray text-sm">
                        {venue.district}
                      </Text>
                      {venue.distance && (
                        <>
                          <Text className="text-medium-gray text-sm"> • </Text>
                          <Text className="text-medium-gray text-sm">
                            {venue.distance} km
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View className="flex-row items-center gap-1 bg-[#2a2a2a] px-2 py-1 rounded-lg">
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text className="text-soft-white text-sm font-semibold">
                      {venue.rating}
                    </Text>
                    <Text className="text-medium-gray text-xs">
                      ({venue.reviews})
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <Text className="text-medium-gray text-sm mb-3">
                  {venue.address}
                </Text>

                {/* Facilities */}
                <View className="flex-row flex-wrap gap-2 mb-3">
                  {venue.facilities.map((facility, index) => (
                    <View key={index} className="bg-[#2a2a2a] px-2 py-1 rounded">
                      <Text className="text-medium-gray text-xs">
                        {facility}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Price and Formats */}
                <View className="flex-row items-center justify-between pt-3 border-t border-[#2a2a2a]">
                  <View>
                    <Text className="text-medium-gray text-xs mb-1">
                      {t('venueSelection.perHour')}
                    </Text>
                    <Text className="text-neon-green text-lg font-bold">
                      {formatPrice(venue.price)}
                    </Text>
                  </View>
                  <View className="flex-row gap-2">
                    {venue.availableFormats.map((format, index) => (
                      <View 
                        key={index} 
                        className="bg-neon-green px-3 py-1 rounded-lg"
                      >
                        <Text className="text-dark-black text-xs font-bold">
                          {format}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredVenues.length === 0 && (
          <View className="items-center justify-center py-20">
            <Ionicons name="location-outline" size={64} color={theme.colors.textSecondary} />
            <Text className="text-medium-gray text-lg mt-4">
              {t('venueSelection.noResults')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VenueSelectionScreen;

