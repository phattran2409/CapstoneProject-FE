import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Modal, Animated, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@/shared/theme';
import { useTranslation } from 'react-i18next';
import { 
  ThemedSafeAreaView, 
  ThemedView, 
  ThemedText,
  ThemedScrollView,
  ThemedIcon,
  } from '@/shared/components/themed';
import { RootStackParamList } from '@/app/navigation/types';
import { Button, ChatInMatches } from '@/shared/components';
import { 
  FormationField, 
  FormationFieldRef, 
  FormationPlayer, 
  FormationData,
  getFormationNames,
} from '@/shared/components/formation';
import { useAuthStore } from '@/features/auth/store/authStore';
type RoomDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RoomDetail'>;

interface RoomDetailScreenProps {
  navigation?: RoomDetailScreenNavigationProp;
  route?: {
    params: {
      roomId: string;
    };
  };
}

type SelectedTeam = 'teamA' | 'teamB';

const RoomDetailScreen: React.FC<RoomDetailScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { roomId } = route?.params || { roomId: '1' };
  const [showChat, setShowChat] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const formationRef = useRef<FormationFieldRef>(null);
  const [isCaptain, setIsCaptain] = useState<boolean>(false);
  const [currentFormationData, setCurrentFormationData] = useState<FormationData | null>(null);
  const handleShowChat = () => {
    setShowChat(!showChat);
  };
  const { user } = useAuthStore();

  // Animate modal when opening/closing
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: showChat ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  
  }, [showChat]);
  // Mock data - replace with real data from API
  const roomData = {
    id: roomId,
    format: '7vs7' as '5vs5' | '7vs7', 
    datetime: '19:00 - 20:30, 28/08',
    venue: {
      name: 'Sân bóng ABC',
      address: '123 Đường XYZ',
    },
    totalPlayers: 10,
    currentPlayers: 9,
    pricePerPlayer: 80000,
    status: 'Sắp diễn ra',
    teams: {
      name: 'Đội A',
      players: [
        { id: 'd3b7b055-ec37-4956-b587-c2edb61b0171', name: 'An Nguyễn', avatar: require('@assets/images/icon.png'), isCaptain: true, role: 'GK' as const },
        { id: '2', name: 'Cường Phạm', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'DF' as const },
        { id: '3', name: 'Emeka Okafor', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'DF' as const },
        { id: '4', name: 'Giang Hoàng', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'MF' as const },
        { id: '5', name: 'Phat Tran', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'FW' as const },
        { id: '6', name: 'Minh Lê', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'DF' as const },
        { id: '7', name: 'Hùng Trần', avatar: require('@assets/images/icon.png'), isCaptain: false, role: 'FW' as const },
      ],
    }
  };

  const [selectedTeam, setSelectedTeam] = useState<SelectedTeam>('teamA');
  const [selectedFormation, setSelectedFormation] = useState<string>('3-3');
  const [isLineupDropdownOpen, setIsLineupDropdownOpen] = useState(false);

  // Get available formations based on format
  const availableFormations = getFormationNames(roomData.format);

  // Update selected formation when format changes
  useEffect(() => {
    const formations = getFormationNames(roomData.format);
    if (!formations.includes(selectedFormation)) {
      setSelectedFormation(formations[0]);
    }
  }, [roomData.format, selectedFormation]);

  useEffect(() => {
    const currentUserPlayer = roomData.teams.players.find(player => player?.id === user?.userId);
    setIsCaptain(currentUserPlayer?.isCaptain === true);
  }, [roomData.teams.players, user?.userId]);

  // Convert team players to FormationPlayer type
  const formationPlayers: FormationPlayer[] = roomData.teams.players.map(player => ({
    id: player.id,
    name: player.name,
    avatar: player.avatar,
    role: player.role,
    isCaptain: player.isCaptain,
  }));

  const handlePlayerPress = (player: FormationPlayer, slotId: string) => {
    console.log('Player pressed:', player.name, 'at slot:', slotId);
    // TODO: Navigate to player profile or show modal
  };

  const handleFormationChange = (data: FormationData) => {
    setCurrentFormationData(data);
    console.log('Formation changed:', data);
  };
 
  const handleSaveFormation = async () => {
    const formationData = formationRef.current?.getFormationData();
    
    if (formationData) { 
      console.log('Saving formation:', formationData);
      // TODO: API call to save formation
      // api.saveFormation(roomId, formationData);
    }
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
              onPress={() => navigation?.goBack()}
              style={styles.backButton}
            >
              <ThemedIcon name="arrow-back" size={24} variant="secondary" />
            </TouchableOpacity>
            <ThemedText size="xl" weight="bold">
              {t('roomDetail.title')}
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={handleShowChat}
            style={styles.chatButton}
          >
            <ThemedIcon 
              name={showChat ? "close-circle" : "chatbubbles"} 
              size={24} 
              variant={showChat ? "accent" : "secondary"} 
            />
            {!showChat && (
              <View 
                style={[
                  styles.chatBadge,
                  {
                    backgroundColor: theme.colors.neonGreen,
                    borderColor: theme.colors.background,
                  }
                ]}
              >
                <ThemedText 
                  size="xs" 
                  weight="bold" 
                  style={styles.chatBadgeText}
                >
                  5
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </ThemedView>

        <ThemedScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.contentContainer}>
            {/* Match Info */}
            <View style={styles.matchInfoSection}>
              <ThemedView 
                style={[
                  styles.matchInfoCard,
                  { backgroundColor: theme.colors.surface }
                ]}
              >
                <View>
                  <ThemedText variant="secondary" size="xs" style={styles.matchInfoLabel}>
                    {t('roomDetail.datetime')}
                  </ThemedText>
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {roomData.datetime}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText variant="secondary" size="xs" style={styles.matchInfoLabel}>
                    {t('roomDetail.venue')}
                  </ThemedText>
                  <ThemedText variant="primary" size="m" weight="medium">
                    {roomData.venue.name}
                  </ThemedText>
                </View>
              </ThemedView>

              <ThemedView 
                style={[
                  styles.matchInfoCard,
                  { backgroundColor: theme.colors.surface }
                ]}
              >
                <View>
                  <ThemedText variant="secondary" size="xs" style={styles.matchInfoLabel}>
                    {t('roomDetail.datetime')}
                  </ThemedText>
                  <ThemedText variant="primary" size="l" weight="semiBold">
                    {roomData.datetime}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText variant="secondary" size="xs" style={styles.matchInfoLabel}>
                    {t('roomDetail.status')}
                  </ThemedText>
                  <ThemedText 
                    variant="accent" 
                    size="m" 
                    weight="bold"
                    style={{ color: theme.colors.neonGreen }}
                  >
                    Sắp diễn ra
                  </ThemedText>
                </View>
              </ThemedView>
            </View>

            {/* Format & Team Info */}
            <ThemedView 
              style={[
                styles.formatTeamCard,
                { backgroundColor: theme.colors.surface }
              ]}
            >
              {/* Format */}
              <View>
                <ThemedText variant="secondary" size="s" style={styles.formatLabel}>
                  {t('roomDetail.format')}
                </ThemedText>
                <View style={styles.formatContainer}>
                  <View 
                    style={[
                      styles.formatBadge,
                      { backgroundColor: theme.colors.neonGreen + '20' }
                    ]}
                  >
                    <ThemedText 
                      variant="accent" 
                      size="m" 
                      weight="bold"
                      style={{ color: theme.colors.neonGreen }}
                    >
                      {roomData.format}
                    </ThemedText>
                  </View>
                </View>
              </View>
              {/* Team Info */}
              <View>
                <ThemedText variant="secondary" size="s" style={styles.formatLabel}>
                  Tên Đội
                </ThemedText>
                <View style={styles.teamInfoContainer}>
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {roomData.teams.name}
                  </ThemedText>
                  <View 
                    style={[
                      styles.teamCountBadge,
                      { backgroundColor: theme.colors.neonGreen + '15' }
                    ]}
                  >
                    <ThemedText 
                      variant="secondary" 
                      size="s"
                      style={{ color: theme.colors.neonGreen }}
                    >
                      {roomData.teams.players.length} / {roomData.format === '5vs5' ? '5' : '7'}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </ThemedView>

            {/* Formation Selector Dropdown */}
            {isCaptain && (
              <View style={styles.lineupSelectorContainer}>
              <ThemedText variant="secondary" size="s" style={styles.lineupLabel}>
                Chọn đội hình:
              </ThemedText>
              <View style={styles.dropdownWrapper}>
                <TouchableOpacity
                  style={[
                    styles.dropdownButton,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                    }
                  ]}
                  onPress={() => setIsLineupDropdownOpen(!isLineupDropdownOpen)}
                >
                  <ThemedText variant="primary" size="m" weight="semiBold">
                    {selectedFormation}
                  </ThemedText>
                  <ThemedIcon 
                    name={isLineupDropdownOpen ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    variant="secondary" 
                  />
                </TouchableOpacity>

                {/* Dropdown Menu */}
                {isLineupDropdownOpen && (
                  <View
                    style={[
                      styles.dropdownMenu,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.border,
                      }
                    ]}
                  >
                    {availableFormations.map((formation) => (
                      <TouchableOpacity
                        key={formation}
                        style={[
                          styles.dropdownItem,
                          {
                            backgroundColor: selectedFormation === formation 
                              ? theme.colors.neonGreen + '20' 
                              : 'transparent',
                            borderBottomWidth: formation !== availableFormations[availableFormations.length - 1] ? 1 : 0,
                            borderBottomColor: theme.colors.border,
                          }
                        ]}
                        onPress={() => {
                          setSelectedFormation(formation);
                          setIsLineupDropdownOpen(false);
                        }}
                      >
                        <ThemedText 
                          variant="primary" 
                          size="m" 
                          weight={selectedFormation === formation ? "bold" : "medium"}
                          style={{ 
                            color: selectedFormation === formation 
                              ? theme.colors.neonGreen 
                              : theme.colors.textPrimary 
                          }}
                        >
                          {formation}
                        </ThemedText>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View> )}

            {/* Field Layout - Formation View */}
            <View 
              style={[
                styles.fieldContainer,
                {
                  borderColor: theme.colors.border,
                }
              ]}
            >
              <FormationField
                ref={formationRef}
                players={formationPlayers}
                format={roomData.format}
                formationName={selectedFormation}
                editable={isCaptain}
                onPlayerPress={handlePlayerPress}
                onFormationChange={handleFormationChange}
                showBench={isCaptain}
              />
            </View>
            {isCaptain && ( 
              <View style={styles.saveButtonContainer}>
                <Button
                  title="Lưu đội hình"
                  onPress={handleSaveFormation}
                />
              </View>
            )}

            {/* Check-in & Payment */}
            <View style={styles.paymentSection}>
              <ThemedView
                style={[
                  styles.paymentCard,
                  { backgroundColor: theme.colors.surface }
                ]}
              >
                <ThemedText variant="primary" size="l" weight="bold" style={styles.paymentTitle}>
                  Check-in & Thanh toán
                </ThemedText>
                <View style={styles.paymentRow}>
                  <ThemedText variant="secondary" size="s">
                    Tiền sân mỗi người:
                  </ThemedText>
                  <ThemedText variant="primary" size="l" weight="bold">
                    {roomData.pricePerPlayer.toLocaleString('vi-VN')}đ
                  </ThemedText>
                </View>

                <View style={styles.paymentButtons}>
                  <TouchableOpacity
                    style={[
                      styles.paymentButton,
                      {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.neonGreen,
                      }
                    ]}
                  >
                    <ThemedIcon name="qr-code" size={20} variant="accent" />
                    <ThemedText
                      size="m"
                      weight="bold"
                      style={[styles.paymentButtonText, { color: theme.colors.neonGreen }]}
                    >
                      Check-in Ngay
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.paymentButton,
                      {
                        backgroundColor: theme.colors.neonGreen,
                      }
                    ]}
                  >
                    <ThemedIcon name="card" size={20} color="#000" />
                    <ThemedText
                      size="m"
                      weight="bold"
                      style={[styles.paymentButtonText, { color: '#000' }]}
                    >
                      Thanh toán
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </ThemedView>
            </View>
          
          </View>
        </ThemedScrollView>

        {/* Chat Modal */}
        <Modal
          visible={showChat}
          animationType="none"
          transparent={true}
          onRequestClose={() => setShowChat(false)}
        >
          <View style={styles.modalContainer}>
            {/* Backdrop */}
            <TouchableOpacity 
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setShowChat(false)}
            >
              <Animated.View 
                style={[
                  styles.modalBackdropOverlay,
                  {
                    opacity: slideAnim,
                  }
                ]}
              />
            </TouchableOpacity>

            {/* Modal Content */}
            <Animated.View
              style={[
                styles.modalContent,
                {
                  backgroundColor: theme.colors.background,
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [600, 0],
                      }),
                    },
                  ],
                }
              ]}
            >
              {/* Modal Header */}
              <View
                style={[
                  styles.modalHeader,
                  {
                    borderBottomColor: theme.colors.border,
                    backgroundColor: theme.colors.background,
                  }
                ]}
              >
                <View style={styles.modalHeaderContent}>
                  <View style={styles.modalHeaderIcon}>
                    <ThemedIcon name="chatbubbles" size={24} variant="accent" />
                  </View>
                  <View style={styles.modalHeaderText}>
                    <ThemedText size="l" weight="bold">
                      Chat Đội
                    </ThemedText>
                    <ThemedText size="xs" variant="secondary">
                      Trò chuyện với thành viên trong đội
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowChat(false)}
                    style={styles.modalCloseButton}
                  >
                    <ThemedIcon name="close" size={24} variant="secondary" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Chat Content */}
              <View style={styles.chatContent}>
                <ChatInMatches 
                  roomId={roomId}
                  maxHeight={600}
                  showHeader={false}
                  onSendMessage={(message: string) => {
                    console.log('Message sent:', message);
                    // TODO: Send message to API
                  }}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
    </ThemedSafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    paddingVertical: 40,
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
  chatButton: {
    position: 'relative',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  chatBadgeText: {
    color: '#000',
    fontSize: 10,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  matchInfoSection: {
    marginBottom: 24,
  },
  matchInfoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  matchInfoLabel: {
    marginBottom: 4,
  },
  formatTeamCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  formatLabel: {
    marginBottom: 8,
  },
  formatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  formatBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  teamInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teamCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  lineupSelectorContainer: {
    marginBottom: 16,
  },
  lineupLabel: {
    marginBottom: 8,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldContainer: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: '#111',
    padding: 16,
  },
  saveButtonContainer: {
    marginTop: 16,
  },
  paymentSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  paymentCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  paymentTitle: {
    marginBottom: 8,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentButtons: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 12,
  },
  paymentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  paymentButtonText: {
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalBackdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    borderBottomWidth: 1,
    paddingTop: 8,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  modalHeaderIcon: {
    marginRight: 12,
  },
  modalHeaderText: {
    flex: 1,
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  chatContent: {
    height: 600,
  },
});

export default RoomDetailScreen;
