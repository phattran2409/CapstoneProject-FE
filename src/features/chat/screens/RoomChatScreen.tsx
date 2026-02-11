import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RouteProp } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import { RootStackParamList } from "@/app/navigation/types";
import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemedText, ThemedView, ThemedIcon } from "@/shared/components/themed";
import {
  MessageList,
  Message,
  MessageListRef,
  TypingIndicator,
} from "@/shared/components";
import { getRelativeTime } from "@/shared/utils/dateUtils";
import { useAuthStore } from "@/features/auth/store/authStore";
import {
  useRoomChatMessages,
  useSendRoomChatMessage,
} from "@/features/chat/hooks/useRoomChatMessages";
import {
  useMatchRoomSignalR,
  RoomChatChannel,
  RoomMessage,
  RoomMessagesPayload,
  ParticipantUpdatedPayload,
} from "@/shared/hooks/useMatchRoomSignalR";
import { useMatchRoomSignalRHandlers } from "@/shared/hooks/useMatchRoomSignalRHandlers";
import { useMatchRoomDetail } from "@/features/rooms";
import { ChannelButton } from "../components/ChannelButton";
import { useRoomTypingIndicator } from "../hooks/useRoomTypingIndicator";
import { useRoomMessageSender } from "../hooks/useRoomMessageSender";
import {
  transformRoomMessage,
  addMessageIfNotExists,
} from "../utils/roomChatHelpers";

type RoomChatScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "RoomChat"
>;
type RoomChatScreenRouteProp = RouteProp<RootStackParamList, "RoomChat">;

interface RoomChatScreenProps {
  navigation: RoomChatScreenNavigationProp;
  route: RoomChatScreenRouteProp;
}

const RoomChatScreen: React.FC<RoomChatScreenProps> = ({
  navigation,
  route,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { roomId } = route.params;
  const currentUser = user?.userId || "";

  // Fetch room data để lấy team assignment
  const { data: roomData } = useMatchRoomDetail(roomId);

  // Get user's team assignment từ roomData
  const userTeamAssignment = useMemo(() => {
    if (!roomData || !currentUser) return null;
    const allParticipants = [
      ...roomData.participants.teamA,
      ...roomData.participants.teamB,
      ...roomData.participants.unassigned,
    ];
    const participant = allParticipants.find((p) => p.userId === currentUser);
    return participant?.teamAssignment || null;
  }, [roomData, currentUser]);

  // Channel state - tự động sync với team assignment
  // Default to General channel (all participants can see)
  const getDefaultChannel = useCallback((): RoomChatChannel => {
    // User can always see General channel, but default to their team channel if assigned
    if (userTeamAssignment === "A") return RoomChatChannel.TeamA;
    if (userTeamAssignment === "B") return RoomChatChannel.TeamB;
    return RoomChatChannel.General; // Unassigned hoặc chưa có team
  }, [userTeamAssignment]);

  const [currentChannel, setCurrentChannel] = useState<RoomChatChannel>(() => {
    return getDefaultChannel();
  });

  // Message input state
  const [message, setMessage] = useState("");

  // MessageList ref
  const messageListRef = useRef<MessageListRef>(null);
  const isAtBottomRef = useRef(true);
  const hasScrolledToBottomRef = useRef(false);

  // Fetch messages từ REST API
  const {
    roomChatMessages,
    loading,
    refreshing,
    loadingMore,
    error,
    refresh,
    loadMore,
    setRoomChatMessages,
  } = useRoomChatMessages({
    roomId,
    channel: currentChannel,
    pageSize: 50,
    enabled: !!roomId,
  });

  // Send message mutation
  const { mutateAsync: sendRoomChatMessage, isPending: isSending } =
    useSendRoomChatMessage();

  // Track previous team assignment to detect actual changes (not manual channel switches)
  const prevTeamAssignmentRef = useRef<string | null>(null);

  // Auto sync channel khi team assignment thay đổi (không phải khi user manually switch)
  useEffect(() => {
    const currentTeamAssignment = userTeamAssignment || "Unassigned";
    const prevTeamAssignment = prevTeamAssignmentRef.current;

    // Chỉ auto-switch khi team assignment thực sự thay đổi (không phải khi user manually switch channel)
    if (
      prevTeamAssignment !== null &&
      prevTeamAssignment !== currentTeamAssignment
    ) {
      // Team assignment đã thay đổi, auto-switch về channel mặc định của team mới
      const defaultChannel = getDefaultChannel();
      setCurrentChannel(defaultChannel);
    }

    prevTeamAssignmentRef.current = currentTeamAssignment;
  }, [userTeamAssignment, getDefaultChannel]);

  // SignalR connection - pass teamAssignment for auto-joining team channels
  const {
    isConnected,
    hasJoinedRoomGroup,
    sendRoomMessage,
    getRoomMessages,
    roomTyping,
    roomStopTyping,
    switchTeamChat,
  } = useMatchRoomSignalR({
    roomId,
    teamAssignment:
      userTeamAssignment === "A"
        ? "A"
        : userTeamAssignment === "B"
          ? "B"
          : null,
    // Handle khi participant updated (join/leave team)
    onParticipantUpdated: useCallback(
      (payload: ParticipantUpdatedPayload) => {
        if (payload.userId === currentUser) {
          const newChannel =
            payload.teamAssignment === "A"
              ? RoomChatChannel.TeamA
              : payload.teamAssignment === "B"
                ? RoomChatChannel.TeamB
                : RoomChatChannel.General;
          setCurrentChannel(newChannel);
        }
      },
      [currentUser],
    ),
    // Room chat callbacks - using helper functions
    onReceiveRoomMessage: useCallback(
      (newMessage: RoomMessage) => {
        if (newMessage.channel === (currentChannel as number)) {
          setRoomChatMessages((prev) => {
            const transformed = transformRoomMessage(newMessage);
            return addMessageIfNotExists(prev, transformed);
          });

          if (isAtBottomRef.current) {
            setTimeout(() => {
              messageListRef.current?.scrollToBottom(true);
            }, 100);
          }
        }
      },
      [currentChannel, setRoomChatMessages],
    ),

    onReceiveRoomMessages: useCallback(
      (payload: RoomMessagesPayload) => {
        if (payload.messages && payload.messages.length > 0) {
          setRoomChatMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.messageId));
            const newMessages = payload.messages
              .filter((m: RoomMessage) => !existingIds.has(m.messageId))
              .map((m: RoomMessage) => transformRoomMessage(m));
            return [...prev, ...newMessages];
          });
        }
      },
      [setRoomChatMessages],
    ),
  });

  // Typing indicator hook
  const typingIndicator = useRoomTypingIndicator({
    currentChannel,
    currentUserId: currentUser,
    roomTyping,
    roomStopTyping,
    isSignalRReady: isConnected && hasJoinedRoomGroup,
  });

  // Track if SignalR is fully ready (with a small delay after joining room group)
  const [isSignalRReady, setIsSignalRReady] = useState(false);

  useEffect(() => {
    if (hasJoinedRoomGroup && isConnected) {
      // Add delay to ensure user context is fully established in backend
      // Backend needs time to set up IUserContext after JoinRoomGroup
      const timer = setTimeout(() => {
        setIsSignalRReady(true);
      }, 1000); // Increased to 1 second to ensure user context is ready
      return () => clearTimeout(timer);
    } else {
      setIsSignalRReady(false);
    }
  }, [hasJoinedRoomGroup, isConnected]);

  // Map room messages to MessageList format
  const messages: Message[] = useMemo(() => {
    if (!roomChatMessages) return [];
    return roomChatMessages.map((m) => ({
      id: m.messageId,
      sender: m.senderId,
      senderName: m.senderFullName,
      text: m.messageText,
      timestamp: getRelativeTime(m.sentAt),
      isOwn: m.senderId === currentUser,
      isRead: true,
      avatar: m.senderAvatarUrl,
    }));
  }, [roomChatMessages, currentUser]);

  // Auto scroll khi load messages lần đầu
  useEffect(() => {
    if (
      !loading &&
      roomChatMessages &&
      roomChatMessages.length > 0 &&
      !hasScrolledToBottomRef.current
    ) {
      hasScrolledToBottomRef.current = true;
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(false);
        isAtBottomRef.current = true;
      }, 500);
    }
  }, [loading, roomChatMessages]);

  // Track previous channel to detect actual changes
  const prevChannelRef = useRef<RoomChatChannel | null>(null);
  // Track if this is the initial mount to avoid calling switchTeamChat on mount
  const isInitialMountRef = useRef(true);

  // Handle channel switching via SignalR when channel changes
  // Note: Messages are loaded via REST API (useRoomChatMessages), not SignalR
  // SignalR is only used for real-time message updates
  useEffect(() => {
    // Wait for SignalR to be fully connected, room group joined, and ready
    if (!isConnected || !hasJoinedRoomGroup || !isSignalRReady || !roomId)
      return;

    const isChannelChanged = prevChannelRef.current !== currentChannel;

    // On initial mount, JoinRoomGroup already joins the team channel
    // So we don't need to call switchTeamChat
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      prevChannelRef.current = currentChannel;
      hasScrolledToBottomRef.current = false;
      return;
    }

    if (!isChannelChanged) return; // Only act on actual channel changes

    prevChannelRef.current = currentChannel;

    // Only switch team chat if switching to a team channel
    // Note:
    // - General channel is already joined from JoinRoomGroup, no need to switch
    // - JoinRoomGroup already joins the user's team channel on initial connection
    // - So we only need to switch when user manually changes to a different team channel
    if (
      currentChannel === RoomChatChannel.TeamA ||
      currentChannel === RoomChatChannel.TeamB
    ) {
      const teamAssignment =
        currentChannel === RoomChatChannel.TeamA ? "A" : "B";
      // Only switch if user's team assignment doesn't match the channel they're switching to
      // This allows users to view other team channels if they have permission
      // Add delay to ensure user context is fully established (isSignalRReady already has delay)
      if (userTeamAssignment !== teamAssignment) {
        switchTeamChat(teamAssignment).catch((error) => {
          console.error("❌ Failed to switch team chat:", error);
        });
      }
    }
    // General channel: No action needed, already joined from JoinRoomGroup

    hasScrolledToBottomRef.current = false;
  }, [
    currentChannel,
    isConnected,
    hasJoinedRoomGroup,
    isSignalRReady,
    roomId,
    switchTeamChat,
    userTeamAssignment,
  ]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingIndicator.cleanup();
    };
  }, [typingIndicator]);

  // Handle scroll position
  const handleScrollToBottom = useCallback((isAtBottom: boolean) => {
    isAtBottomRef.current = isAtBottom;
  }, []);

  // Handle layout
  const handleMessageListLayout = useCallback(() => {
    if (
      !hasScrolledToBottomRef.current &&
      roomChatMessages &&
      roomChatMessages.length > 0
    ) {
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(false);
        isAtBottomRef.current = true;
        hasScrolledToBottomRef.current = true;
      }, 100);
    }
  }, [roomChatMessages]);

  // Handle typing detection với debounce
  const handleTextChange = useCallback(
    (text: string) => {
      typingIndicator.handleTextChange(text, setMessage);
    },
    [typingIndicator],
  );

  // Message sender hook
  const messageSender = useRoomMessageSender({
    roomId,
    currentChannel,
    isSignalRReady,
    sendRoomMessage,
    sendRoomChatMessage,
    setRoomChatMessages,
    onMessageSent: () => {
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
        isAtBottomRef.current = true;
      }, 100);
    },
  });

  // Handle send message
  const handleSend = async () => {
    if (!message.trim() || !roomId || isSending) return;

    typingIndicator.stopTyping();
    const messageText = message.trim();
    setMessage(""); // Clear input immediately for better UX

    try {
      await messageSender.sendMessage(messageText);
    } catch (e) {
      console.error("❌ sendRoomChatMessage error:", e);
      // Restore message on error
      setMessage(messageText);
    }
  };

  // Get typing indicator text from hook
  const typingIndicatorText = typingIndicator.typingIndicatorText;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <ThemedText size="l" weight="bold">
            Chat Phòng
          </ThemedText>
          <ThemedText size="xs" variant="secondary">
            {roomData?.field.venue.venueName || "Room Chat"}
          </ThemedText>
        </View>

        {/* Channel Selector */}
        <View style={styles.channelSelector}>
          <ChannelButton
            channel={RoomChatChannel.General}
            currentChannel={currentChannel}
            label="Tất cả"
            onPress={setCurrentChannel}
          />

          {userTeamAssignment === "A" && (
            <ChannelButton
              channel={RoomChatChannel.TeamA}
              currentChannel={currentChannel}
              label="Team A"
              onPress={setCurrentChannel}
            />
          )}

          {userTeamAssignment === "B" && (
            <ChannelButton
              channel={RoomChatChannel.TeamB}
              currentChannel={currentChannel}
              label="Team B"
              onPress={setCurrentChannel}
            />
          )}
        </View>
      </View>

      {/* Typing Indicator */}
      {typingIndicatorText && (
        <View
          style={[
            styles.typingIndicator,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <ThemedText size="xs" variant="secondary">
            {typingIndicatorText}
          </ThemedText>
        </View>
      )}

      {/* Messages List */}
      <MessageList
        ref={messageListRef}
        messages={messages}
        inverted={false}
        loadMore={loadMore}
        refreshing={refreshing}
        onRefresh={refresh}
        renderEmpty={() => (
          <View style={styles.emptyContainer}>
            <ThemedText variant="secondary" size="m">
              Chưa có tin nhắn nào
            </ThemedText>
          </View>
        )}
        renderFooter={() =>
          loadingMore ? (
            <View style={styles.loadingMore}>
              <ThemedText variant="secondary" size="xs">
                Đang tải thêm...
              </ThemedText>
            </View>
          ) : null
        }
        onScrollToBottom={handleScrollToBottom}
        onLayout={handleMessageListLayout}
        contentContainerStyle={{ paddingVertical: theme.spacing.m }}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.inputContainer,
          {
            borderTopColor: theme.colors.border,
            backgroundColor: theme.colors.background,
          },
        ]}
      >
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: theme.colors.textPrimary,
              },
            ]}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={theme.colors.textSecondary}
            value={message}
            onChangeText={handleTextChange}
            multiline
            onSubmitEditing={handleSend}
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || isSending}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                message.trim() && !isSending
                  ? theme.colors.neonGreen
                  : theme.colors.border,
            },
          ]}
        >
          <Ionicons
            name="send"
            size={20}
            color={
              message.trim() && !isSending ? "#000" : theme.colors.textSecondary
            }
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  channelSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  channelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typingIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingMore: {
    paddingVertical: 16,
    alignItems: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 10 : 6,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
});

export default RoomChatScreen;
