import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';
import { RootStackParamList } from '../navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

type ChatListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatList'>;

interface ChatListScreenProps {
  navigation: ChatListScreenNavigationProp;
}

interface ChatItem {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  isOnline: boolean;
  avatar?: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const chats: ChatItem[] = [
    {
      id: '1',
      name: 'Đội bóng The Avengers',
      lastMessage: 'Tuyệt vời! Hẹn gặp lại vào cuối tuần.',
      timestamp: '10:42 AM',
      isOnline: true,
    },
    {
      id: '2',
      name: 'Ronaldo',
      lastMessage: 'Bạn sẵn sàng cho trận đấu tối nay...',
      timestamp: '9:15 AM',
      isOnline: true,
    },
    {
      id: '3',
      name: 'Messi',
      lastMessage: 'Kế hoạch cho trận 5vs5 thế nào?',
      timestamp: t('chat.yesterday'),
      isOnline: false,
    },
    {
      id: '4',
      name: 'Neymar Jr',
      lastMessage: 'Đã nhận được lời mời của bạn.',
      timestamp: t('chat.friday'),
      isOnline: false,
    },
  ];

  const renderChatItem = ({ item }: { item: ChatItem }) => (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.xs,
        alignItems: 'center',
      }}
      onPress={() => navigation.navigate('Chat', { chatId: item.id, chatName: item.name })}
    >
      <View style={{ position: 'relative' }}>
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Ionicons name="person" size={32} color={theme.colors.textSecondary} />
        </View>
        {item.isOnline && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: theme.colors.neonGreen,
              borderWidth: 2,
              borderColor: theme.colors.surface,
            }}
          />
        )}
      </View>
      <View style={{ flex: 1, marginLeft: theme.spacing.m }}>
        <Text
          style={{
            fontSize: theme.fontSizes.m,
            color: theme.colors.text,
            fontWeight: '600',
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: theme.fontSizes.s,
            color: theme.colors.textSecondary,
          }}
          numberOfLines={1}
        >
          {item.lastMessage}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text
          style={{
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textSecondary,
            marginBottom: theme.spacing.xs,
          }}
        >
          {item.timestamp}
        </Text>
        {item.isOnline && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.colors.neonGreen,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.m,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: '700',
          }}
        >
          {t('chat.title')}
        </Text>
        <TouchableOpacity>
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.m }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatListScreen;


