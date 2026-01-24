/**
 * Example: Using MessageList component in a different screen
 *
 * This example demonstrates how to reuse the MessageList component
 * in a group chat or any other messaging context.
 */

import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/shared/theme";
import { MessageList, Message } from "@/shared/components";
import Ionicons from "@expo/vector-icons/Ionicons";

/**
 * Example: Group Chat Screen using MessageList
 */
export const GroupChatExample = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");

  // Example messages for a group chat
  const messages: Message[] = [
    {
      id: "1",
      sender: "user1",
      senderName: "Alice",
      text: "Hey everyone! Ready for the match?",
      timestamp: "09:00 AM",
      isOwn: false,
    },
    {
      id: "2",
      sender: "user2",
      senderName: "Bob",
      text: "Yes! Can't wait!",
      timestamp: "09:05 AM",
      isOwn: false,
    },
    {
      id: "3",
      sender: "me",
      senderName: "You",
      text: "I'll be there in 10 minutes",
      timestamp: "09:10 AM",
      isOwn: true,
    },
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message logic here
      setMessage("");
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Messages List - Reusable Component */}
      <MessageList messages={messages} />

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
          <TextInput
            style={{
              flex: 1,
              fontSize: theme.fontSizes.m,
              color: theme.colors.text,
              paddingVertical: theme.spacing.s,
            }}
            placeholder="Type a message..."
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
          >
            <Ionicons name="send" size={20} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

/**
 * Example: Direct Message Screen with inverted mode
 * (Messages appear from bottom, like WhatsApp)
 */
export const DirectMessageExample = () => {
  const { theme } = useTheme();

  const messages: Message[] = [
    {
      id: "1",
      sender: "friend",
      senderName: "Sarah",
      text: "See you at the field!",
      timestamp: "2:30 PM",
      isOwn: false,
    },
    {
      id: "2",
      sender: "me",
      senderName: "You",
      text: "Sure! See you soon!",
      timestamp: "2:31 PM",
      isOwn: true,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      {/* Using inverted mode for real-time chat feel */}
      <MessageList messages={messages} inverted={true} />
    </View>
  );
};

/**
 * Example: Custom styled message list
 */
export const CustomStyledExample = () => {
  const { theme } = useTheme();

  const messages: Message[] = [
    {
      id: "1",
      sender: "coach",
      senderName: "Coach Mike",
      text: "Great practice today, team!",
      timestamp: "5:00 PM",
      isOwn: false,
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MessageList
        messages={messages}
        contentContainerStyle={{
          paddingVertical: theme.spacing.l,
          paddingHorizontal: theme.spacing.s,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
