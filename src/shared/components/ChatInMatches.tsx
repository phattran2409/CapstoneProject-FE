import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard
} from 'react-native';
import { useTheme } from '../theme';
import { ThemedText, ThemedView, ThemedIcon } from './themed';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
  avatar?: string;
}

interface ChatInMatchesProps {
  roomId: string;
  teamId?: string;
  currentUserId?: string;
  maxHeight?: number;
  showHeader?: boolean;
  onSendMessage?: (message: string) => void;
}

const ChatInMatches: React.FC<ChatInMatchesProps> = ({ 
  roomId, 
  teamId,
  currentUserId = 'current-user',
  maxHeight = 400,
  showHeader = true,
  onSendMessage 
}) => {
  const { theme } = useTheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      senderId: 'user1',
      senderName: 'An Nguyễn',
      text: 'Mọi người chuẩn bị sẵn sàng chưa?',
      timestamp: new Date(Date.now() - 600000),
      isOwn: false,
    },
    {
      id: '2',
      senderId: 'user2',
      senderName: 'Bình Lê',
      text: 'Tôi đã đến sân rồi, vị trí tập trung ở đâu nhỉ?',
      timestamp: new Date(Date.now() - 480000),
      isOwn: false,
    },
    {
      id: '3',
      senderId: currentUserId,
      senderName: 'Bạn',
      text: 'Tập trung ở cổng chính nhé, 15 phút nữa bắt đầu!',
      timestamp: new Date(Date.now() - 300000),
      isOwn: true,
    },
    {
      id: '4',
      senderId: 'user3',
      senderName: 'Cường Phạm',
      text: 'Ok, tôi đang trên đường. Đội hình đã fix chưa?',
      timestamp: new Date(Date.now() - 180000),
      isOwn: false,
    },
    {
      id: '5',
      senderId: currentUserId,
      senderName: 'Bạn',
      text: 'Rồi, mình chơi 3-1 nhé. Xem đội hình ở trên!',
      timestamp: new Date(Date.now() - 120000),
      isOwn: true,
    },
  ]);
  
  const scrollViewRef = useRef<ScrollView>(null);

  // Auto scroll to bottom when new message arrives
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const formatTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleSend = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        senderId: currentUserId,
        senderName: 'Bạn',
        text: message.trim(),
        timestamp: new Date(),
        isOwn: true,
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Callback to parent
      if (onSendMessage) {
        onSendMessage(message.trim());
      }
      
      Keyboard.dismiss();
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <View
      style={{
        flexDirection: 'row',
        marginBottom: theme.spacing.m,
        paddingHorizontal: theme.spacing.s,
        justifyContent: item.isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      {/* Avatar for other users */}
      {!item.isOwn && (
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.neonGreen + '20',
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing.xs,
          }}
        >
          <ThemedText 
            size="s" 
            weight="bold"
            style={{ color: theme.colors.neonGreen }}
          >
            {item.senderName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
      )}

      <View style={{ flex: 1, maxWidth: '75%', alignItems: item.isOwn ? 'flex-end' : 'flex-start' }}>
        {/* Sender name (only for others) */}
        {!item.isOwn && (
          <ThemedText
            variant="secondary"
            size="xs"
            style={{ marginBottom: 4, marginLeft: 8 }}
          >
            {item.senderName}
          </ThemedText>
        )}

        {/* Message bubble */}
        <View
          style={{
            backgroundColor: item.isOwn 
              ? theme.colors.neonGreen 
              : theme.colors.surface,
            borderRadius: 16,
            paddingHorizontal: 14,
            paddingVertical: 10,
            maxWidth: '100%',
            borderWidth: item.isOwn ? 0 : 1,
            borderColor: theme.colors.border,
          }}
        >
          <ThemedText
            size="m"
            style={{ 
              color: item.isOwn ? '#000' : theme.colors.textPrimary,
              lineHeight: 20,
            }}
          >
            {item.text}
          </ThemedText>
        </View>

        {/* Timestamp */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 4,
            paddingHorizontal: 8,
          }}
        >
          {item.isOwn && (
            <View style={{ marginRight: 4 }}>
              <ThemedIcon 
                name="checkmark-done" 
                size={14} 
                color={theme.colors.neonGreen}
              />
            </View>
          )}
          <ThemedText
            variant="secondary"
            size="xs"
          >
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ThemedView style={{ flex: 1, maxHeight }}>
        {/* Chat Header */}
        {showHeader && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: theme.spacing.m,
              paddingVertical: theme.spacing.s,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginRight: 8 }}>
                <ThemedIcon 
                  name="chatbubbles" 
                  size={20} 
                  variant="accent"
                />
              </View>
              <ThemedText size="m" weight="bold">
                Chat Đội
              </ThemedText>
            </View>
            <View
              style={{
                backgroundColor: theme.colors.neonGreen + '20',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 12,
              }}
            >
              <ThemedText 
                size="xs" 
                weight="semiBold"
                style={{ color: theme.colors.neonGreen }}
              >
                {messages.length} tin nhắn
              </ThemedText>
            </View>
          </View>
        )}

        {/* Messages List */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{ 
            paddingVertical: theme.spacing.m,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {messages.map((item) => (
            <View key={item.id}>
              {renderMessage({ item })}
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: theme.spacing.m,
            paddingVertical: theme.spacing.s,
            borderTopWidth: 1,
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          }}
        >
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: theme.colors.surface,
              borderRadius: 24,
              paddingHorizontal: 14,
              paddingVertical: Platform.OS === 'ios' ? 10 : 6,
              borderWidth: 1,
              borderColor: theme.colors.border,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: theme.fontSizes.m,
                color: theme.colors.textPrimary,
                maxHeight: 80,
              }}
              placeholder="Nhập tin nhắn..."
              placeholderTextColor={theme.colors.textSecondary}
              value={message}
              onChangeText={setMessage}
              multiline
              onSubmitEditing={handleSend}
            />
          </View>

          <TouchableOpacity
            onPress={handleSend}
            disabled={!message.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: message.trim() 
                ? theme.colors.neonGreen 
                : theme.colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginLeft: theme.spacing.s,
            }}
          >
            <ThemedIcon 
              name="send" 
              size={20} 
              color={message.trim() ? '#000' : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

export default ChatInMatches;

