import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTranslation } from 'react-i18next';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Types
export interface Field {
  id: string;
  name: string;
  fieldType: string;
  maxPlayers: number;
  pricePerHour: number;
  description: string;
  status?: 'available' | 'booked' | 'maintenance';
  time: {
    id: string;
    startTime: string;
    endTime: string;
  }[]
}


export interface VenueWithFields {
  id: string;
  name: string;
  address: string;
  district: string;
  price: number;
  rating: number;
  reviews: number;
  image: any;
  fields: Field[];
  facilities: string[];
  availableFormats: string[];
  distance?: number;
}

interface FieldsModalProps {
  visible: boolean;
  venue: VenueWithFields | null;
  onClose: () => void;
  onSelectField: (venue: VenueWithFields, field: Field) => void;
  theme: any;
}

const FieldsModal: React.FC<FieldsModalProps> = ({ 
  visible, 
  venue, 
  onClose, 
  onSelectField, 
  theme 
}) => {
  const { t } = useTranslation();
  const [selectedTimeKey, setSelectedTimeKey] = useState<string | null>(null);
  if (!venue) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getFieldTypeColor = (fieldType: string) => {
    switch (fieldType) {
      case '5vs5':
        return '#10B981';
      case '7vs7':
        return '#3B82F6';
      case '11vs11':
        return '#8B5CF6';
      default:
        return theme.colors.neonGreen;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'booked':
        return '#EF4444';
      case 'maintenance':
        return '#F59E0B';
      default:
        return '#10B981';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'available':
        return 'Còn trống';
      case 'booked':
        return 'Đã đặt';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return 'Còn trống';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: '#121212' }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: '#2a2a2a' }]}>
            <View style={styles.modalHeaderLeft}>
              <View style={[styles.fieldIconContainer, { backgroundColor: theme.colors.neonGreen + '20' }]}>
                <Ionicons name="football" size={24} color={theme.colors.neonGreen} />
              </View>
              <View style={styles.modalTitleContainer}>
                <Text style={[styles.modalTitle, { color: theme.colors.softWhite }]}>
                  {venue.name}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.colors.textSecondary }]}>
                  {venue.fields.length} sân có sẵn
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: '#2a2a2a' }]}
            >
              <Ionicons name="close" size={20} color={theme.colors.softWhite} />
            </TouchableOpacity>
          </View>

          {/* Fields List */}
          <ScrollView 
            style={styles.fieldsScrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {venue.fields.map((field, index) => {
              const isAvailable = field.status !== 'booked' && field.status !== 'maintenance';
              
              return (
                <TouchableOpacity
                  key={field.id}
                  style={[
                    styles.fieldCard,
                    { 
                      backgroundColor: '#1a1a1a',
                      borderColor: isAvailable ? '#2a2a2a' : '#3a3a3a',
                      opacity: isAvailable ? 1 : 0.6,
                    }
                  ]}
                  onPress={() => isAvailable && onSelectField(venue, field)}
                  disabled={!isAvailable}
                  activeOpacity={0.7}
                >
                  {/* Field Header */}
                  <View style={styles.fieldCardHeader}>
                    <View style={styles.fieldNameSection}>
                      <View style={[
                        styles.fieldNumberBadge,
                        { backgroundColor: getFieldTypeColor(field.fieldType) + '20' }
                      ]}>
                        <Text style={[styles.fieldNumber, { color: getFieldTypeColor(field.fieldType) }]}>
                          {index + 1}
                        </Text>
                      </View>
                      <View style={styles.fieldNameContainer}>
                        <Text style={[styles.fieldName, { color: theme.colors.softWhite }]}>
                          {field.name}
                        </Text>
                        <Text style={[styles.fieldDescription, { color: theme.colors.textSecondary }]}>
                          {field.description}
                        </Text>
                      </View>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(field.status) + '20' }
                    ]}>
                      <View style={[styles.statusDot, { backgroundColor: getStatusColor(field.status) }]} />
                      <Text style={[styles.statusText, { color: getStatusColor(field.status) }]}>
                        {getStatusText(field.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Field Info */}
                  <View style={styles.fieldInfoRow}>
                    {/* Field Type */}
                    <View style={styles.fieldInfoItem}>
                      <Ionicons name="people" size={16} color={theme.colors.textSecondary} />
                      <Text style={[styles.fieldInfoText, { color: theme.colors.textSecondary }]}>
                        Loại sân
                      </Text>
                      <View style={[
                        styles.fieldTypeBadge,
                        { backgroundColor: getFieldTypeColor(field.fieldType) }
                      ]}>
                        <Text style={styles.fieldTypeText}>{field.fieldType}</Text>
                      </View>
                    </View>

                    {/* Max Players */}
                    {field.maxPlayers > 0 && (
                      <View style={styles.fieldInfoItem}>
                        <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
                        <Text style={[styles.fieldInfoText, { color: theme.colors.textSecondary }]}>
                          Tối đa
                        </Text>
                        <Text style={[styles.fieldInfoValue, { color: theme.colors.softWhite }]}>
                          {field.maxPlayers} người
                        </Text>
                      </View>
                    )}
                  </View>
                  <View>
                    <Text style={[styles.timeTitle, { color: theme.colors.softWhite }]}>
                      Các khung giờ
                    </Text>
                    <View style={styles.timeItemContainer}>
                        {field.time.map((time) => {
                        const key = `${field.id}-${time.id}`;
                        const isSelected = selectedTimeKey === key;
                        return (
                            <TouchableOpacity
                            key={time.id}
                            style={[
                                styles.itemTimeButton,
                                { 
                                backgroundColor: isSelected ? theme.colors.neonGreen + '20' : theme.colors.surface,
                                borderColor: isSelected ? theme.colors.neonGreen : 'transparent',
                                borderWidth: 1,
                                },
                            ]}
                            onPress={() => setSelectedTimeKey(key)}
                            >
                            <Text
                                style={[
                                styles.timeItemText,
                                { color: isSelected ? theme.colors.neonGreen : theme.colors.textSecondary },
                                ]}
                            >
                                {time.startTime} ~ {time.endTime}
                            </Text>
                            </TouchableOpacity>
                        );
                        })}
                    </View>
                  </View>
                  {/* Price and Action */}
                  <View style={styles.fieldFooter}>
                    <View style={styles.priceSection}>
                      <Text style={[styles.pricePerHourLabel, { color: theme.colors.textSecondary }]}>
                        Giá thuê
                      </Text>
                      <Text style={[styles.pricePerHour, { color: theme.colors.neonGreen }]}>
                        {formatPrice(field.pricePerHour)}/giờ
                      </Text>
                    </View>
                    
                    {isAvailable && (
                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          { 
                            backgroundColor: theme.colors.neonGreen,
                            opacity: selectedTimeKey?.startsWith(field.id + '-') ? 1 : 0.5,
                          },
                        ]}
                        disabled={!selectedTimeKey?.startsWith(field.id + '-')}
                        onPress={() => onSelectField(venue, field)}
                      >
                        <Ionicons name="calendar-outline" size={18} color={theme.colors.darkBlack} />
                        <Text style={[styles.bookButtonText, { color: theme.colors.darkBlack }]}>
                          Đặt sân
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleContainer: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldsScrollView: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  // Field Card styles
  fieldCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  fieldCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  fieldNameSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fieldNameContainer: {
    flex: 1,
  },
  fieldNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldNumber: {
    fontSize: 18,
    fontWeight: '700',
  },
  fieldName: {
    fontSize: 16,
    fontWeight: '600',
  },
  fieldDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 16,
  },
  fieldInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fieldInfoText: {
    fontSize: 13,
  },
  fieldInfoValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  fieldTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  fieldTypeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },
  fieldFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  priceSection: {},
  pricePerHourLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  pricePerHour: {
    fontSize: 18,
    fontWeight: '700',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    color: '#fff',
  },
  timeItem: {
    fontWeight: '400',
  },
  timeItemText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fff',
  },
  itemTimeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  timeItemContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});

export default FieldsModal;

