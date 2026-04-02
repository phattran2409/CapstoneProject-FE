import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  MessageList,
  Message,
  MessageListRef,
  EmptyState,
  LoadingMoreIndicator,
  ErrorState,
  ChatSkeleton,
  TypingIndicator,
} from "@/shared/components";
import { getRelativeTime } from "@/shared/utils/dateUtils";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useChatMessages,
  useSendChatMessage,
  useMarkChatAsRead,
} from "../hooks";
import { useChatSignalR } from "@/shared/hooks/useChatSignalR";
import { useChatSignalRHandlers } from "@/shared/hooks/useChatSignalRHandlers";

type ChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Chat"
>;
type ChatScreenRouteProp = RouteProp<RootStackParamList, "Chat">;

interface ChatScreenProps {
  navigation: ChatScreenNavigationProp;
  route: ChatScreenRouteProp;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ navigation, route }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [message, setMessage] = useState("");
  const { chatName, chatId: otherUserId } = route.params;
  const currentUserId = user?.userId;

  // State for typing indicator and online status
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingTimeRef = useRef<number>(0);
  const messageListRef = useRef<MessageListRef>(null);
  const isAtBottomRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);

  // Fetch conversation messages via REST API
  const {
    chatMessages,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setChatMessages,
  } = useChatMessages({ otherUserId, pageSize: 50 });
  const { mutateAsync: sendChatMessage, isPending: isSending } =
    useSendChatMessage();
  const { mutate: markChatAsRead } = useMarkChatAsRead();

  // Tạo SignalR handlers với logic phổ biến
  const signalRHandlers = useChatSignalRHandlers({
    otherUserId,
    currentUserId,
    chatName,
    setChatMessages,
    setIsOtherUserTyping,
    typingTimeoutRef,
    setIsOtherUserOnline,
    isAtBottomRef,
    messageListRef: messageListRef.current || undefined,
  });

  // SignalR connection với handlers
  const { isConnected, typing, stopTyping, getOnlineStatus } =
    useChatSignalR(signalRHandlers);

  // Map dữ liệu API -> UI MessageList
  const messages: Message[] = useMemo(() => {
    if (!chatMessages) return [];
    return chatMessages.map((m) => ({
      id: m.messageId,
      sender: m.senderId,
      senderName: m.senderName,
      text: m.messageText,
      timestamp: getRelativeTime(m.sentAt),
      isOwn: m.isMine,
      isRead: m.isRead,
    }));
  }, [chatMessages]);

  // Đánh dấu đã đọc khi mở màn hình
  useEffect(() => {
    if (otherUserId) {
      markChatAsRead(otherUserId);
    }
  }, [otherUserId, markChatAsRead]);

  // Lấy online status khi mở màn hình
  useEffect(() => {
    if (isConnected && otherUserId) {
      getOnlineStatus(otherUserId);
    }
  }, [isConnected, otherUserId, getOnlineStatus]);

  // Auto scroll đến tin nhắn mới nhất khi load xong messages lần đầu
  useEffect(() => {
    if (
      !loading &&
      chatMessages &&
      chatMessages.length > 0 &&
      !hasScrolledToBottomRef.current
    ) {
      hasScrolledToBottomRef.current = true;
      // Delay để đảm bảo FlatList đã render xong
      // Với non-inverted mode, cần delay lâu hơn để content được render
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(false);
        isAtBottomRef.current = true;
      }, 500);
    }
  }, [loading, chatMessages]);

  // Reset scroll flag khi chuyển conversation
  useEffect(() => {
    hasScrolledToBottomRef.current = false;
    isAtBottomRef.current = true;
  }, [otherUserId]);

  // Handle scroll position tracking
  const handleScrollToBottom = useCallback((isAtBottom: boolean) => {
    isAtBottomRef.current = isAtBottom;
  }, []);
  
  // Handle layout để scroll khi FlatList đã render xong
  const handleMessageListLayout = useCallback(() => {
    if (
      !hasScrolledToBottomRef.current &&
      chatMessages &&
      chatMessages.length > 0
    ) {
      // Scroll ngay khi layout được render
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(false);
        isAtBottomRef.current = true;
        hasScrolledToBottomRef.current = true;
      }, 100);
    }
  }, [chatMessages]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Xử lý typing detection với debounce
  const handleTextChange = useCallback(
    (text: string) => {
      setMessage(text);

      const now = Date.now();
      // Chỉ gửi typing signal mỗi 2 giây một lần
      if (now - lastTypingTimeRef.current > 2000) {
        if (isConnected && otherUserId && text.trim().length > 0) {
          typing(otherUserId);
          lastTypingTimeRef.current = now;
        }
      }

      // Gửi stopTyping sau 3 giây không gõ
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isConnected && otherUserId) {
          stopTyping(otherUserId);
        }
      }, 3000);
    },
    [isConnected, otherUserId, typing, stopTyping],
  );

  const handleSend = async () => {
    if (!message.trim() || !otherUserId || !currentUserId || isSending) return;

    // Gửi stopTyping khi gửi tin nhắn
    if (isConnected) {
      stopTyping(otherUserId);
    }

    try {
      await sendChatMessage({
        senderId: currentUserId,
        receiverId: otherUserId,
        messageText: message.trim(),
        messageType: "Text",
      });
      setMessage("");

      // Auto scroll sau khi gửi tin nhắn
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
        isAtBottomRef.current = true;
      }, 100);
    } catch (e) {
      console.log("❌ sendChatMessage error:", e);
    }
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="chatbubble-ellipses-outline"
        title={t("chat.empty")}
        description={t("chat.inviteFriends")}
      />
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return <LoadingMoreIndicator />;
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.m,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginRight: theme.spacing.m }}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: theme.colors.border,
            justifyContent: "center",
            alignItems: "center",
            marginRight: theme.spacing.s,
          }}
        >
          <Ionicons name="person" size={24} color={theme.colors.text} />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: theme.fontSizes.l,
              color: theme.colors.text,
              fontWeight: "600",
            }}
          >
            {chatName}
          </Text>

          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}
          >
            {isOtherUserOnline && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: theme.colors.neonGreen,
                  marginRight: theme.spacing.xs,
                }}
              />
            )}
            <Text
              style={{
                fontSize: theme.fontSizes.xs,
                color: theme.colors.textSecondary,
              }}
            >
              {isOtherUserOnline ? t("chat.online") : t("chat.offline")}
            </Text>
          </View>
        </View>
      </View>

      {/* Typing Indicator */}
      {isOtherUserTyping && <TypingIndicator userName={chatName} />}

      {loading && <ChatSkeleton messageCount={5} />}

      {error && <ErrorState error={error} onRetry={refresh} />}

      {/* Messages List */}
      {!loading && !error && (
        <MessageList
          ref={messageListRef}
          messages={messages}
          inverted={false}
          loadMore={loadMore}
          refreshing={refreshing}
          onRefresh={refresh}
          renderEmpty={renderEmpty}
          renderFooter={renderFooter}
          onScrollToBottom={handleScrollToBottom}
          onLayout={handleMessageListLayout}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.s,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radius.l,
            paddingHorizontal: theme.spacing.s,
          }}
        >
          <TouchableOpacity
            style={{ marginRight: theme.spacing.s }}
          ></TouchableOpacity>
          <TextInput
            style={{
              flex: 1,
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              paddingVertical: theme.spacing.s,
            }}
            placeholder={t("chat.inputPlaceholder")}
            placeholderTextColor={theme.colors.textSecondary}
            value={message}
            onChangeText={handleTextChange}
            multiline
          />
          <TouchableOpacity
            onPress={handleSend}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: theme.colors.neonGreen,
              justifyContent: "center",
              alignItems: "center",
              marginLeft: theme.spacing.s,
            }}
            disabled={isSending || !message.trim()}
          >
            <Ionicons name="send" size={20} color={theme.colors.black} />
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
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ChatScreen;
