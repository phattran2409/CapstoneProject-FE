import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useVenues, Venue as VenueType } from '@/features/venues';
import { RootStackParamList } from '@/app/navigation/types';
import { FieldsModal, Field, VenueWithFields } from '../components';


type VenueSelectionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VenueSelection'>;

interface VenueSelectionScreenProps {
  navigation?: VenueSelectionScreenNavigationProp;
}

// Use types from FieldsModal component
type Venue = VenueWithFields;

const VenueSelectionScreen: React.FC<VenueSelectionScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | '5vs5' | '7vs7'>('all');
  const [fieldsModalVisible, setFieldsModalVisible] = useState(false);
  const [selectedVenueForFields, setSelectedVenueForFields] = useState<Venue | null>(null);

  // ✅ Fetch venues from API
  const { 
    data: venuesData, 
    isLoading, 
    isError,
    refetch 
  } = useVenues({
    format: selectedFilter !== 'all' ? selectedFilter : undefined,
  });

  // Filter venues by search query
  const venues = useMemo(() => {
    if (!venuesData) return [];
    console.log('venuesData', venuesData);
    if (!searchQuery.trim()) return venuesData;
    
    const query = searchQuery.toLowerCase();
    // return venuesData.filter(
    //   (venue) =>
    //     venue.name.toLowerCase().includes(query) ||
    //     venue.address.toLowerCase().includes(query) ||
    //     venue.district?.toLowerCase().includes(query)
    // );
    return venuesData;
  }, [venuesData, searchQuery]);

  // Mock data fallback - will be removed once API is ready
  const mockVenues: Venue[] = [
    {
      id: '1',
      name: 'Sân bóng Thảo Điền',
      address: '123 Đường Xuân Thủy, Thảo Điền',
      district: 'Quận 2',
      price: 500000,
      rating: 4.8,
      reviews: 245,
      image: require('@assets/images/icon.png'),
      facilities: ['Parking', 'Shower', 'Locker'],
      fields: [
        {
          id: "1",
          name: "Sân A - Mini",
          fieldType: "5vs5",
          maxPlayers: 10,
          pricePerHour: 250000,
          description: "Sân cỏ nhân tạo, đèn chiếu sáng",
          status: 'available',
          time: [
            {
              id: "1",
              startTime: "09:00",
              endTime: "11:00",
            },
            {
              id: "2",
              startTime: "11:00",
              endTime: "13:00",
            } 
          ]
        },
        {
          id: "2",
          name: "Sân B - Trung",
          fieldType: "7vs7",
          maxPlayers: 14,
          pricePerHour: 450000,
          description: "Sân cỏ nhân tạo cao cấp",
          status: 'available',
          time: [
            {
              id: "1",
              startTime: "09:00",
              endTime: "11:00",
            }
          ]
        },
        {
          id: "3",
          name: "Sân C - VIP",
          fieldType: "7vs7",
          maxPlayers: 14,
          pricePerHour: 600000,
          description: "Sân VIP có phòng thay đồ riêng",
          status: 'booked',
          time: [
            {
              id: "1",
              startTime: "09:00",
              endTime: "11:00",
            }
          ]
        },
        {
          id: "4",
          name: "Sân D - Mini",
          fieldType: "5vs5",
          maxPlayers: 10,
          pricePerHour: 280000,
          description: "Sân mới nâng cấp 2024",
          status: 'available',
          time: [
            {
              id: "1",
              startTime: "09:00",
              endTime: "11:00",
            }
          ]
        },
      ],
      availableFormats: ['5vs5', '7vs7'],
      distance: 2.5,
    },
    // {
    //   id: '2',
    //   name: 'Sân Bình Thạnh FC',
    //   address: '456 Điện Biên Phủ',
    //   district: 'Bình Thạnh',
    //   price: 400000,
    //   rating: 4.6,
    //   reviews: 189,
    //   image: require('@assets/images/icon.png'),
    //   facilities: ['Parking', 'Canteen'],
    //   availableFormats: ['5vs5'],
    //   distance: 3.2,
    // },
    // {
    //   id: '3',
    //   name: 'Sân Long Biên Sports',
    //   address: '789 Võ Văn Ngân',
    //   district: 'Thủ Đức',
    //   price: 450000,
    //   rating: 4.7,
    //   reviews: 312,
    //   image: require('@assets/images/icon.png'),
    //   facilities: ['Parking', 'Shower', 'Locker', 'Canteen'],
    //   availableFormats: ['5vs5', '7vs7'],
    //   distance: 4.1,
    // },
    // {
    //   id: '4',
    //   name: 'Sân Phú Nhuận Arena',
    //   address: '321 Phan Đăng Lưu',
    //   district: 'Phú Nhuận',
    //   price: 550000,
    //   rating: 4.9,
    //   reviews: 428,
    //   image: require('@assets/images/icon.png'),
    //   facilities: ['Parking', 'Shower', 'Locker', 'Canteen', 'Referee'],
    //   availableFormats: ['5vs5', '7vs7'],
    //   distance: 1.8,
    // },
    // {
    //   id: '5',
    //   name: 'Sân Tân Bình Center',
    //   address: '654 Cộng Hòa',
    //   district: 'Tân Bình',
    //   price: 380000,
    //   rating: 4.5,
    //   reviews: 156,
    //   image: require('@assets/images/icon.png'),
    //   facilities: ['Parking', 'Shower'],
    //   availableFormats: ['5vs5'],
    //   distance: 5.3,
    // },
  ];

  // const filteredVenues = venues.filter(venue => {
  //   const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //                        venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //                        venue.district.toLowerCase().includes(searchQuery.toLowerCase());
    
  //   const matchesFilter = selectedFilter === 'all' || venue.availableFormats.includes(selectedFilter);
    
  //   return matchesSearch && matchesFilter;
  // });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSelectVenue = (venue: Venue) => {
    navigation?.navigate('CreateRoom', { selectedVenue: venue });
  };

  const handleOpenFieldsModal = (venue: Venue) => {
    setSelectedVenueForFields(venue);
    setFieldsModalVisible(true);
  };

  const handleCloseFieldsModal = () => {
    setFieldsModalVisible(false);
    setSelectedVenueForFields(null);
  };

  const handleSelectField = (venue: Venue, field: Field) => {
    handleCloseFieldsModal();
    navigation?.navigate('CreateRoom', { 
      selectedVenue: {
        id: venue.id,
        name: venue.name,
        address: venue.address,
        price: venue.price,
        rating: venue.rating,
        image: venue.image,
      },
      selectedField: {
        id: field.id,
        name: field.name,
        fieldType: field.fieldType,
        maxPlayers: field.maxPlayers,
        pricePerHour: field.pricePerHour,
        description: field.description,
        status: field.status,
      }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.darkBlack }]}>
      {/* Header */}
      <View style={[styles.header, { paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m, borderBottomWidth: 1, borderBottomColor: '#2a2a2a' }]}>
        <View style={[styles.headerTop, { marginBottom: theme.spacing.m }]}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              onPress={() => navigation?.goBack()}
              style={styles.iconButton}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.softWhite} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Ionicons name="location" size={28} color={theme.colors.neonGreen} />
              <Text style={[styles.title, { color: theme.colors.softWhite, fontSize: theme.fontSizes.xxl }]}>
                {t('venueSelection.title')}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBar, { backgroundColor: '#1a1a1a', borderRadius: theme.radius.m, paddingHorizontal: theme.spacing.m, paddingVertical: 12, marginBottom: theme.spacing.m }]}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.softWhite, marginLeft: 8, flex: 1 }]}
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
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === 'all' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === 'all' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              {t('venueSelection.allFormats')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === '5vs5' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('5vs5')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === '5vs5' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              5 vs 5
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              {
                backgroundColor: selectedFilter === '7vs7' ? theme.colors.neonGreen : '#1a1a1a',
                paddingHorizontal: theme.spacing.m,
                paddingVertical: 8,
                borderRadius: theme.radius.m,
              },
            ]}
            onPress={() => setSelectedFilter('7vs7')}
          >
            <Text style={[styles.filterText, { color: selectedFilter === '7vs7' ? theme.colors.darkBlack : theme.colors.textSecondary, fontWeight: '600' }]}>
              7 vs 7
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Venues List */}
      <ScrollView style={styles.flex1} showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: theme.spacing.l, paddingVertical: theme.spacing.m }}>
          {mockVenues?.map((venue) => (
            <TouchableOpacity
              key={venue.id}
              style={[
                styles.venueCard,
                {
                  backgroundColor: '#1a1a1a',
                  borderRadius: theme.radius.l,
                  marginBottom: theme.spacing.m,
                  overflow: 'hidden',
                  borderWidth: 1,
                  borderColor: '#2a2a2a',
                },
              ]}
              onPress={() => handleSelectVenue(venue)}
            >
              {/* Venue Image */}
              <Image
                source={venue.image}
                style={styles.venueImage}
                resizeMode="cover"
              />

              <View style={{ padding: theme.spacing.m }}>
                {/* Venue Name and Rating */}
                <View style={[styles.venueHeader, { marginBottom: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.venueName, { color: theme.colors.softWhite }]}>
                      {venue.name}
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
                      <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                        {venue.district}
                      </Text>
                      {venue.distance && (
                        <>
                          <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}> • </Text>
                          <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                            {venue.distance} km
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                  <View style={[styles.ratingBadge, { backgroundColor: '#2a2a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: theme.radius.s }]}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={[styles.ratingText, { color: theme.colors.softWhite, fontWeight: '600' }]}>
                      {venue.rating}
                    </Text>
                    <Text style={[styles.reviewsText, { color: theme.colors.textSecondary }]}>
                      ({venue.reviews})
                    </Text>
                  </View>
                </View>

                {/* Address */}
                <Text style={[styles.address, { color: theme.colors.textSecondary, marginBottom: 12 }]}>
                  {venue.address}
                </Text>

                {/* Facilities */}
                <View style={[styles.facilitiesContainer, { marginBottom: 12 }]}>
                  {venue.facilities.map((facility, index) => (
                    <View key={index} style={[styles.facilityTag, { backgroundColor: '#2a2a2a', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }]}>
                      <Text style={[styles.facilityText, { color: theme.colors.textSecondary }]}>
                        {facility}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Fields Count Indicator */}
                {venue.fields && venue.fields.length > 0 && (
                  <TouchableOpacity
                    style={[styles.fieldsIndicator, { 
                      backgroundColor: theme.colors.neonGreen + '15',
                      borderColor: theme.colors.neonGreen + '30',
                    }]}
                    onPress={() => handleOpenFieldsModal(venue)}
                  >
                    <View style={styles.fieldsIndicatorLeft}>
                      <Ionicons name="football-outline" size={20} color={theme.colors.neonGreen} />
                      <View>
                        <Text style={[styles.fieldsCount, { color: theme.colors.neonGreen }]}>
                          {venue.fields.length} sân có sẵn
                        </Text>
                        <Text style={[styles.fieldsHint, { color: theme.colors.textSecondary }]}>
                          Nhấn để xem chi tiết & đặt sân
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.neonGreen} />
                  </TouchableOpacity>
                )}

                {/* Price and Formats */}
                <View style={[styles.priceRow, { paddingTop: 12, borderTopWidth: 1, borderTopColor: '#2a2a2a' }]}>
                  <View>
                    <Text style={[styles.priceLabel, { color: theme.colors.textSecondary, marginBottom: 4 }]}>
                      {t('venueSelection.perHour')}
                    </Text>
                    <Text style={[styles.priceValue, { color: theme.colors.neonGreen }]}>
                      {formatPrice(venue.price)}
                    </Text>
                  </View>
                  <View style={styles.formatsContainer}>
                    {venue.availableFormats.map((format, index) => (
                      <View 
                        key={index} 
                        style={[styles.formatBadge, { backgroundColor: theme.colors.neonGreen, paddingHorizontal: 12, paddingVertical: 4, borderRadius: theme.radius.s }]}
                      >
                        <Text style={[styles.formatText, { color: theme.colors.darkBlack, fontWeight: '700' }]}>
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

        {venues.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
              {t('venueSelection.noResults')}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Fields Modal */}
      <FieldsModal
        visible={fieldsModalVisible}
        venue={selectedVenueForFields}
        onClose={handleCloseFieldsModal}
        onSelectField={handleSelectField}
        theme={theme}
      />
    </SafeAreaView>
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
    // Styles applied via inline
  },
  headerTop: {
    // Styles applied via inline
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    // Styles applied via inline
  },
  filterText: {
    fontSize: 14,
  },
  venueCard: {
    // Styles applied via inline
  },
  venueImage: {
    width: '100%',
    height: 192,
  },
  venueHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  venueName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
  },
  reviewsText: {
    fontSize: 12,
  },
  address: {
    fontSize: 14,
  },
  facilitiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  facilityTag: {
    // Styles applied via inline
  },
  facilityText: {
    fontSize: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLabel: {
    fontSize: 12,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  formatsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  formatBadge: {
    // Styles applied via inline
  },
  formatText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    marginTop: 16,
  },
  // Fields Indicator styles
  fieldsIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  fieldsIndicatorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  fieldsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  fieldsHint: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default VenueSelectionScreen;
