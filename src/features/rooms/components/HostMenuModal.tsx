import { ThemedText } from '@/shared/components/themed/ThemedText';
import { Modal, View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '@react-navigation/native';
import { useState } from 'react';
import { Room } from '../types/room.types';
import { ShareRoom } from './ShareRoom';

interface HostMenuModalProps {
    room: Room;
    visible: boolean;
    handleShowMenuModal: () => void;
    handleCancelRoom: () => void;
    isCancelling: boolean;
}


const HostMenuModal: React.FC<HostMenuModalProps> = ({ room, visible, handleShowMenuModal, handleCancelRoom, isCancelling }) => {
    const theme = useTheme();
    const [shareRoomVisible, setShareRoomVisible] = useState(false);

    const handleShareRoom = () => {
        // Close menu modal first
        handleShowMenuModal();
        // Then open share room modal
        setShareRoomVisible(true);
    };

    const shareUrl = `kickify://room/${room.id}`;
    const shareMessage = `Join my football match!\n\nFormat: ${room?.format}\nDate: ${new Date(room?.datetime || '').toLocaleString('vi-VN')}\nVenue: ${room?.venue?.name || 'TBA'}\n\nJoin here: ${shareUrl}`;
    
    return (
    <>
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleShowMenuModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleShowMenuModal}
        >
          <View style={[styles.menuModal, { backgroundColor: theme.colors.card }]}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleShareRoom}
            >
              <Ionicons name="share-outline" size={24} color={theme.colors.text} />
              <ThemedText size="m" weight="medium" style={[styles.menuItemText, { color: theme.colors.text }]}>
                Share Room
              </ThemedText>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: theme.colors.border }]} />
            
            <TouchableOpacity
              style={[styles.menuItem]}
              onPress={() => {
                handleShowMenuModal();
                handleCancelRoom();
              }}
              disabled={isCancelling}
            >
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
              <ThemedText 
                size="m" 
                weight="medium" 
                style={[styles.menuItemText, { color: '#EF4444' }]}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Room'}
              </ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.menuCancelButton}
              onPress={handleShowMenuModal}
            >
              <ThemedText size="m" weight="medium" variant="secondary" >
                Cancel
              </ThemedText>
            </TouchableOpacity>
         
          </View>
        </TouchableOpacity>
      </Modal>
      
      {/* Share Room Modal */}
      <ShareRoom 
        visible={shareRoomVisible} 
        shareUrl={shareUrl} 
        shareMessage={shareMessage}
        handleClose={() => setShareRoomVisible(false)} 
      />
    </>
    );

    
};


const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuModal: {
        width: '85%',
        maxHeight: '80%',
        borderRadius: 12,
        padding: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuItemText: {
        flex: 1,
    },
    menuDivider: {
        height: 1,
        marginVertical: 8,
    },
    menuCancelButton: {
        marginTop: 8,
        paddingVertical: 16,
        alignItems: 'center',
    }
});




export { HostMenuModal };