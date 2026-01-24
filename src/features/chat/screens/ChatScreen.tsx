import React, { useEffect, useMemo, useState } from "react";
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
import { MessageList, Message } from "@/shared/components";
import { getRelativeTime } from "@/shared/utils/dateUtils";
import { useAuthStore } from "@/features/auth/store/authStore";
import { useChatMessages, useSendChatMessage, useMarkChatAsRead } from "../hooks";
import { useChatSignalR } from "../hooks/useChatSignalR";

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

  // Fetch conversation messages via REST API
  const { data, isLoading } = useChatMessages(otherUserId);
  const { mutateAsync: sendChatMessage, isPending: isSending } = useSendChatMessage();
  const { mutate: markChatAsRead } = useMarkChatAsRead();

  // Optional: giữ kết nối SignalR để nhận realtime / online status sau này
  const { isConnected } = useChatSignalR();

  // Map dữ liệu API -> UI MessageList
  const messages: Message[] = useMemo(() => {
    if (!data?.messages) return [];
    return data.messages.map((m) => ({
      id: m.messageId,
      sender: m.senderId,
      senderName: m.senderName,
      text: m.messageText,
      timestamp: getRelativeTime(m.sentAt),
      isOwn: m.isMine,
    }));
  }, [data]);

  // Đánh dấu đã đọc khi mở màn hình
  useEffect(() => {
    if (otherUserId) {
      markChatAsRead(otherUserId);
    }
  }, [otherUserId, markChatAsRead]);

  const handleSend = async () => {
    if (!message.trim() || !otherUserId || !currentUserId || isSending) return;
    try {
      await sendChatMessage({
        senderId: currentUserId,
        receiverId: otherUserId,
        messageText: message.trim(),
        messageType: "Text",
      });
      setMessage("");
    } catch (e) {
      console.log("❌ sendChatMessage error:", e);
    }
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
        <Text
          style={{
            flex: 1,
            fontSize: theme.fontSizes.l,
            color: theme.colors.text,
            fontWeight: "600",
          }}
        >
          {chatName}
        </Text>
        <TouchableOpacity>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={theme.colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* SignalR status */}
      <View
        style={{
          paddingHorizontal: theme.spacing.m,
          paddingVertical: theme.spacing.xs,
        }}
      >
        <Text
          style={{
            fontSize: theme.fontSizes.xs,
            color: theme.colors.textSecondary,
          }}
        >
          SignalR: {isConnected ? "CONNECTED" : "CONNECTING..."}
        </Text>
      </View>

      {/* Messages List */}
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: theme.colors.textSecondary }}>{t("common.loading")}</Text>
        </View>
      ) : (
        <MessageList messages={messages} />
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
          <TouchableOpacity style={{ marginRight: theme.spacing.s }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: theme.colors.border,
                justifyContent: "center",
                alignItems: "center",
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
            placeholder={t("chat.inputPlaceholder")}
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
              justifyContent: "center",
              alignItems: "center",
              marginLeft: theme.spacing.s,
            }}
          disabled={isSending || !message.trim()}
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
