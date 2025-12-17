import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/shared/theme';
import { RootStackParamList } from '@/app/navigation/types';
import Ionicons from '@expo/vector-icons/Ionicons';

type ChatScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  avatar?: any;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [message, setMessage] = useState('');
  const { chatName } = route.params;

  const messages: Message[] = [
    {
      id: '1',
      sender: 'john',
      senderName: 'John Doe',
      text: 'Hey team, are we ready for the 7v7 match this weekend?',
      timestamp: '10:30 AM',
      isOwn: false,
    },
    {
      id: '2',
      sender: 'me',
      senderName: t('chat.you'),
      text: 'Absolutely! I\'ve been practicing my free kicks. Can\'t wait!',
      timestamp: '10:31 AM',
      isOwn: true,
    },
    {
      id: '3',
      sender: 'sarah',
      senderName: 'Sarah Lee',
      text: 'Awesome! I\'ll bring some water for everyone. Let\'s make sure we have our formation sorted out before the game.',
      timestamp: '10:32 AM',
      isOwn: false,
    },
    {
      id: '4',
      sender: 'me',
      senderName: t('chat.you'),
      text: 'Good call. I\'ll be there 15 minutes early to warm up.',
      timestamp: '10:33 AM',
      isOwn: true,
    },
  ];

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.m,
        justifyContent: item.isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      {!item.isOwn && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.xs,
          }}
        >
          <Ionicons name="person" size={20} color={theme.colors.textSecondary} />
        </View>
      )}
      <View style={{ flex: item.isOwn ? 0 : 1, maxWidth: '75%' }}>
        {!item.isOwn && (
          <Text
            style={{
              fontSize: theme.fontSizes.xs,
              color: item.isOwn ? theme.colors.neonGreen : theme.colors.text,
              marginBottom: theme.spacing.xs,
              marginLeft: theme.spacing.xs,
            }}
          >
            {item.senderName}
          </Text>
        )}
        <View
          style={{
            backgroundColor: item.isOwn ? theme.colors.neonGreen : theme.colors.surface,
            borderRadius: theme.radius.m,
            padding: theme.spacing.s,
            alignSelf: item.isOwn ? 'flex-end' : 'flex-start',
          }}
        >
          <Text
            style={{
              fontSize: theme.fontSizes.m,
              color: item.isOwn ? theme.colors.white : theme.colors.text,
            }}
          >
            {item.text}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: theme.spacing.xs,
            alignSelf: item.isOwn ? 'flex-end' : 'flex-start',
          }}
        >
          {item.isOwn && (
            <>
              <Text
                style={{
                  fontSize: theme.fontSizes.xs,
                  color: theme.colors.textSecondary,
                  marginRight: theme.spacing.xs,
                }}
              >
                {t('chat.sent')}
              </Text>
              <Ionicons name="checkmark-done" size={12} color={theme.colors.neonGreen} />
              <Ionicons name="checkmark-done" size={12} color={theme.colors.neonGreen} style={{ marginLeft: -4 }} />
            </>
          )}
          <Text
            style={{
              fontSize: theme.fontSizes.xs,
              color: theme.colors.textSecondary,
              marginLeft: item.isOwn ? theme.spacing.xs : 0,
            }}
          >
            {item.timestamp}
          </Text>
        </View>
      </View>
    </View>
  );

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.m,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: theme.spacing.m }}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.s,
          }}
        >
          <Ionicons name="person" size={24} color={theme.colors.textSecondary} />
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: '600',
          }}
        >
          {chatName}
        </Text>
        <TouchableOpacity>
          <Ionicons name="ellipsis-vertical" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: theme.spacing.m }}
        inverted={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.s,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.l,
            paddingHorizontal: theme.spacing.s,
          }}
        >
          <TouchableOpacity style={{ marginRight: theme.spacing.s }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.border,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </View>
          </TouchableOpacity>
          <TextInput
            style={{
              flex: 1,
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              paddingVertical: theme.spacing.s,
            }}
            placeholder={t('chat.inputPlaceholder')}
            placeholderTextColor={theme.colors.textSecondary}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.neonGreen,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: theme.spacing.s,
            }}
          >
            <Ionicons name="send" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default ChatScreen;


