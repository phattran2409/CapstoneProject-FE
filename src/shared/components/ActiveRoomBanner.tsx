import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Dimensions, Modal, PanResponder } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/shared/theme';
import { useActiveRoomStore } from '@/features/rooms/store/activeRoomStore';
import { useRoomDetail } from '@/features/rooms';
import { useAuthStore } from '@/features/auth/store/authStore';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.85;
const BUTTON_SIZE = 60;

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ActiveRoomBanner: React.FC = () => {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const { roomId, clearActiveRoom } = useActiveRoomStore();
  const { user } = useAuthStore();
  const [showPanel, setShowPanel] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  
  // Animation for floating button
  const buttonScale = useRef(new Animated.Value(0)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(0)).current;
  
  // Track button position
  const buttonYOffset = useRef(0);
  const initialButtonBottom = 100; // Default bottom position

  // Fetch room data if roomId exists
  const { data: room, isLoading } = useRoomDetail(roomId || '', {
    enabled: !!roomId && !!user,
  });

  // Check if user is the host
  const isHost = room?.hostId === user?.id;
  // Only show if user is authenticated
  const isAuthenticated = !!user;
  // Show button if user is authenticated, has roomId, and room is active
  const shouldShow = isAuthenticated && roomId && (!room || (room.status !== 'completed' && room.status !== 'cancelled'));


  // Show/hide floating button
  useEffect(() => {
    if (isAuthenticated && roomId) {
      setIsButtonVisible(true);
      Animated.parallel([
        Animated.spring(buttonScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(buttonScale, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(buttonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setIsButtonVisible(false));
    }
  }, [isAuthenticated, roomId, buttonScale, buttonOpacity]);

  // Auto-hide button if user is already on RoomInformation screen
  useEffect(() => {
    if (!roomId) return;
    
    const unsubscribe = navigation.addListener('state', () => {
      const state = navigation.getState();
      const currentRoute = state.routes[state.index];
      const params = currentRoute.params as { roomId?: string } | undefined;
      if (currentRoute.name === 'RoomInformation' && params?.roomId === roomId) {
        // Hide button when on RoomInformation
        Animated.parallel([
          Animated.timing(buttonScale, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(buttonOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => setIsButtonVisible(false));
      } else if (shouldShow) {
        // Show button when not on RoomInformation
        setIsButtonVisible(true);
        Animated.parallel([
          Animated.spring(buttonScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
          }),
          Animated.timing(buttonOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    });
    return unsubscribe;
  }, [navigation, roomId, shouldShow, buttonScale, buttonOpacity]);

  // Track if dragging to prevent tap
  const isDragging = useRef(false);
  const dragStartY = useRef(0);
  
  // PanResponder for dragging button
  // Giải thích:
  // - Button có position bottom-based: bottom = initialButtonBottom + insets.bottom
  // - translateY > 0: di chuyển button LÊN TRÊN (giảm khoảng cách từ đáy)
  // - translateY < 0: di chuyển button XUỐNG DƯỚI (tăng khoảng cách từ đáy)
  // - Cần tính toán bounds để button không vượt quá top và bottom của màn hình
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ respond khi có di chuyển vertical đáng kể (>10px)
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: (evt) => {
        // Khi bắt đầu drag: lưu vị trí ban đầu và set offset
        isDragging.current = false;
        dragStartY.current = evt.nativeEvent.pageY;
        buttonTranslateY.setOffset(buttonYOffset.current);
      },
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 10) {
          isDragging.current = true;
        }
        
        // Tính toán vị trí tổng (current offset + gesture movement)
        const currentOffset = buttonYOffset.current;
        const totalOffset = currentOffset + gestureState.dy;
        
        // Tính toán bounds:
        // Button vị trí ban đầu: bottom = initialButtonBottom + insets.bottom
        // translateY = khoảng cách di chuyển từ vị trí ban đầu
        // translateY > 0: button di chuyển LÊN (bottom giảm)
        // translateY < 0: button di chuyển XUỐNG (bottom tăng)
        //
        // - maxY (di chuyển LÊN tối đa - translateY dương):
        //   Vị trí cao nhất: bottom = insets.top + BUTTON_SIZE
        //   maxY = (initialButtonBottom + insets.bottom) - (insets.top + BUTTON_SIZE)
        const maxY = initialButtonBottom + insets.bottom - insets.top - BUTTON_SIZE;
        
        // - minY (di chuyển XUỐNG tối đa - translateY âm):
        //   Button không được kéo ra khỏi màn hình dưới
        //   Vị trí thấp nhất: bottom >= insets.bottom (sát đáy, không ra ngoài)
        //   Cho phép kéo xuống một chút nhưng không quá nhiều
        const minY = -initialButtonBottom;
        
        // Clamp tổng offset trong phạm vi cho phép
        const clampedTotalOffset = Math.max(minY, Math.min(maxY, totalOffset));
        
        // Set giá trị relative (clamped - current) vì offset đã được set trong Grant
        buttonTranslateY.setValue(clampedTotalOffset - currentOffset);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Khi thả tay: tính toán vị trí cuối cùng và lưu lại
        const currentOffset = buttonYOffset.current;
        const newOffset = currentOffset + gestureState.dy;
        
        // Tính lại bounds giống như trong onMove
        const maxY = initialButtonBottom + insets.bottom - insets.top - BUTTON_SIZE;
        const minY = -initialButtonBottom;
        
        // Clamp vị trí cuối cùng trong phạm vi cho phép
        const clampedOffset = Math.max(minY, Math.min(maxY, newOffset));
        
        // Lưu vị trí mới và flatten offset
        buttonYOffset.current = clampedOffset;
        buttonTranslateY.flattenOffset();
        buttonTranslateY.setValue(clampedOffset);
        
        // Reset dragging flag sau một khoảng thời gian ngắn
        setTimeout(() => {
          isDragging.current = false;
        }, 100);
      },
    })
  ).current;

  // Mở panel - không có animation
  const openPanel = () => {
    setShowPanel(true);
  };

  // Đóng panel - không có animation
  const closePanel = () => {
    setShowPanel(false);
  };

  const handleButtonPress = () => {
    if (!isDragging.current) {
      showPanel ? closePanel() : openPanel();
    }
  };

  const handleNavigateToRoom = () => {
    closePanel();
    if (roomId) {
      navigation.navigate('RoomInformation', { roomId });
    }
  };

  const handleDismiss = () => {
    closePanel();
    clearActiveRoom();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Auto-close modal khi roomId bị clear hoặc user logout
  useEffect(() => {
    if ((!roomId || !isAuthenticated) && showPanel) {
      closePanel();
    }
  }, [roomId, isAuthenticated]);

  // Render conditions
  const shouldRenderButton = isAuthenticated && isButtonVisible && roomId && (!room || (room.status !== 'completed' && room.status !== 'cancelled'));
  const shouldRenderModal = showPanel && roomId && isAuthenticated;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Button - Only render if conditions are met */}
      {shouldRenderButton && (
        <Animated.View
          style={[
            styles.floatingButton,
            {
              bottom: initialButtonBottom + insets.bottom, // Above tab bar
              right: 20,
              opacity: buttonOpacity,
              transform: [
                { scale: buttonScale },
                { translateY: buttonTranslateY },
              ],
            },
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={handleButtonPress}
            activeOpacity={0.9}
          >
            <Ionicons name="football" size={24} color="#000" />
            {room && room.currentPlayers > 0 && (
              <View style={[styles.badge, { backgroundColor: '#FF4444' }]}>
                <Text style={styles.badgeText}>{room.currentPlayers}</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Slide Panel Modal - Render independently of button visibility */}
      {shouldRenderModal && (
        <Modal
          visible={showPanel}
          transparent
          animationType="none"
          onRequestClose={closePanel}
        >
        <View style={styles.modalContainer}>
          {/* Backdrop */}
          <View style={styles.backdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={closePanel}
            />
          </View>

          {/* Slide Panel */}
          <View
            style={[
              styles.panel,
              {
                backgroundColor: theme.colors.surface,
                right: 0,
                top: insets.top,
                bottom: insets.bottom + 100, // Above tab bar
              },
            ]}
          >
            {/* Panel Header */}
            <View style={[styles.panelHeader, { borderBottomColor: theme.colors.border }]}>
              <View style={styles.panelHeaderLeft}>
                <View style={[styles.panelIcon, { backgroundColor: theme.colors.neonGreen + '20' }]}>
                  <Ionicons name="football" size={24} color={theme.colors.neonGreen} />
                </View>
                <View>
                  <Text style={[styles.panelTitle, { color: theme.colors.text }]}>
                    Phòng của bạn
                  </Text>
                  <Text style={[styles.panelSubtitle, { color: theme.colors.textSecondary }]}>
                    Đang hoạt động
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={closePanel} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Panel Content */}
            <View style={styles.panelContent}>
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {formatDate(room?.datetime || '')}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  {room?.currentPlayers}/{room?.totalPlayers} người tham gia
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="football-outline" size={20} color={theme.colors.textSecondary} />
                <Text style={[styles.infoText, { color: theme.colors.text }]}>
                  Format: {room?.format}
                </Text>
              </View>

              {room?.description && (
                <View style={styles.descriptionContainer}>
                  <Text style={[styles.descriptionLabel, { color: theme.colors.textSecondary }]}>
                    Mô tả:
                  </Text>
                  <Text style={[styles.descriptionText, { color: theme.colors.text }]}>
                    {room.description}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: theme.colors.neonGreen }]}
                  onPress={handleNavigateToRoom}
                >
                  <Ionicons name="arrow-forward" size={20} color="#000" />
                  <Text style={[styles.actionButtonText, { color: '#000' }]}>
                    Xem chi tiết
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.dismissButtonStyle, { borderColor: theme.colors.border }]}
                  onPress={handleDismiss}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={[styles.actionButtonText, { color: theme.colors.textSecondary }]}>
                    Ẩn thông báo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    zIndex: 1000,
    elevation: 9999,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#66FF66',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000',
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    position: 'absolute',
    width: PANEL_WIDTH,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  panelIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  panelSubtitle: {
    fontSize: 14,
  },
  closeButton: {
    padding: 4,
  },
  panelContent: {
    padding: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  infoText: {
    fontSize: 15,
    flex: 1,
  },
  descriptionContainer: {
    marginTop: 8,
    marginBottom: 24,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  descriptionLabel: {
    fontSize: 12,
    marginBottom: 8,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionButtons: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  dismissButtonStyle: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
