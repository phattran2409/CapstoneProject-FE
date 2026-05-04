
import React from 'react';
import { ThemedCard, ThemedIcon, ThemedText, ThemedView } from "@/shared/components/themed";
import { useTheme } from "@react-navigation/native";
import { Image, StyleSheet, View, Modal, TouchableOpacity, Share } from "react-native";
import { ScrollView } from "react-native";
import Ionicons from '@expo/vector-icons/Ionicons';
import { useToast } from '@/shared/toast';
import { useTranslation } from "react-i18next";


interface ShareRoomProps {
    shareUrl: string;
    shareMessage: string;
    visible: boolean;
    handleClose: () => void;
    title?: string;
    subtitle?: string;
    shareButtonLabel?: string;
}
type Friend = {
    id: string;
    name: string;
    avatar: string;
}
const Friends : Friend[] =  [ 
    {
        id: "1",
        name: "Nguyễn Văn A",
        avatar: "https://via.placeholder.com/150",
    },
    {
        id: "2",
        name: "Trần Minh B",
        avatar: "https://via.placeholder.com/150",
    },
    {
        id: "3",
        name: "Lê Hoàng C",
        avatar: "https://via.placeholder.com/150",
    },
    {
        id: "4",
        name: "Phạm Đức D",
        avatar: "https://via.placeholder.com/150",
    },
    {
        id: "5",
        name: "Hoàng Quốc E",
        avatar: "https://via.placeholder.com/150",
    },
]

const ShareRoom: React.FC<ShareRoomProps> = ({
    visible,
    shareUrl,
    shareMessage,
    handleClose,
    title,
    subtitle,
    shareButtonLabel,
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const { show } = useToast();
    const handleCopyLink = async () => {
        try {
            const result = await Share.share({
                message: shareMessage,
                url: shareUrl,
                title: 'Join my football match',
            });
            
            if (result.action === Share.sharedAction) {
                show({
                    type: 'success',
                    text1: 'Room shared successfully!',
                });
            }
        } catch (error: any) {
            show({
                type: 'error',
                text1: error.message || 'Failed to share room',
            });
        }
    };
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={handleClose}
                />
                <ThemedView style={[styles.shareRoomContainer, { backgroundColor: theme.colors.card }]}>
                    <View style={styles.shareRoomHeader}>
                        <ThemedText size="xl" weight="bold">
                            {title ?? t('roomDetail.shareRoom', 'Chia sẻ phòng')}
                        </ThemedText>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <ThemedIcon name="close" size={24} variant="secondary" />
                        </TouchableOpacity>
                    </View>
                    
                    <ThemedText size="m" variant="secondary" style={styles.shareRoomSubtitle}>
                        {subtitle ?? t('roomDetail.shareRoomSubtitle', 'Bạn bè của bạn có thể tham gia cuộc đấu này')}
                    </ThemedText>
                    
                    <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.friendsContainer}
                    >
                        {Friends.map((friend) => (
                            <TouchableOpacity key={friend.id} style={styles.friendItem}>
                                <ThemedCard style={styles.friendCard}>
                                    <Image source={{ uri: friend.avatar }} style={styles.friendAvatar} />
                                    <ThemedText size="s" weight="medium" numberOfLines={1}>
                                        {friend.name}
                                    </ThemedText>
                                </ThemedCard>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <View style={[styles.menuDevider, {backgroundColor: theme.colors.border}]}>
                    </View>
                    <TouchableOpacity 
                        style={styles.shareLinkContainer}
                        onPress={handleCopyLink}
                    >
                        <Ionicons name="share-outline" size={24} color={theme.colors.text} />
                        <ThemedText size="m" weight="medium" style={{color: theme.colors.primary}}>
                            {shareButtonLabel ?? t('roomDetail.shareLink', 'Share Link')}
                        </ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </View>
        </Modal>
    );
};
const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    shareRoomContainer: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '80%',
    },
    shareRoomHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    closeButton: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareRoomSubtitle: {
        marginBottom: 16,
    },
    friendsContainer: {
        gap: 12,
        paddingVertical: 8,
    },
    friendItem: {
        marginRight: 12,
    },
    friendCard: {
        alignItems: 'center',
        padding: 12,
        minWidth: 80,
    },
    friendAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginBottom: 8,
    },
    menuDevider: {
        height: 1,
        marginVertical: 8,
    },
    shareLinkContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
});
export { ShareRoom };