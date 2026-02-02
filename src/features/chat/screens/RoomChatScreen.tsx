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
import {
  ThemedText,
  ThemedView,
  ThemedIcon,
} from "@/shared/components/themed";
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
  RoomTypingPayload,
  RoomStopTypingPayload,
  ParticipantUpdatedPayload,
} from "@/shared/hooks/useMatchRoomSignalR";
import { useMatchRoomSignalRHandlers } from "@/shared/hooks/useMatchRoomSignalRHandlers";
import { useMatchRoomDetail } from "@/features/rooms";
import type { MatchRoomFullInfo } from "@/features/rooms/types/room.types";

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
  const getDefaultChannel = useCallback((): RoomChatChannel => {
    if (userTeamAssignment === "A") return RoomChatChannel.TeamA;
    if (userTeamAssignment === "B") return RoomChatChannel.TeamB;
    return RoomChatChannel.All; // Unassigned hoặc chưa có team
  }, [userTeamAssignment]);

  const [currentChannel, setCurrentChannel] = useState<RoomChatChannel>(() => {
    return getDefaultChannel();
  });

  // Message input state
  const [message, setMessage] = useState("");

  // Typing state
  const [typingUsers, setTypingUsers] = useState<
    Map<string, RoomTypingPayload>
  >(new Map());
  const typingTimeoutRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );
  const lastTypingTimeRef = useRef<number>(0);

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

  // Auto sync channel khi team assignment thay đổi
  useEffect(() => {
    const defaultChannel = getDefaultChannel();
    if (currentChannel !== defaultChannel) {
      const isChannelMismatch =
        (userTeamAssignment === "A" &&
          currentChannel !== RoomChatChannel.TeamA) ||
        (userTeamAssignment === "B" &&
          currentChannel !== RoomChatChannel.TeamB) ||
        (userTeamAssignment === "Unassigned" &&
          currentChannel !== RoomChatChannel.All);

      if (isChannelMismatch) {
        setCurrentChannel(defaultChannel);
      }
    }
  }, [userTeamAssignment, getDefaultChannel, currentChannel]);

  // SignalR handlers
  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: currentUser,
    // Handle khi participant updated (join/leave team)
    onParticipantUpdated: useCallback(
      (payload: ParticipantUpdatedPayload) => {
        if (payload.userId === currentUser) {
          const newChannel =
            payload.teamAssignment === "A"
              ? RoomChatChannel.TeamA
              : payload.teamAssignment === "B"
                ? RoomChatChannel.TeamB
                : RoomChatChannel.All;
          setCurrentChannel(newChannel);
        }
      },
      [currentUser],
    ),
    // Room chat callbacks
    onNewRoomMessage: useCallback(
      (newMessage: RoomMessage) => {
        if (newMessage.channel === (currentChannel as number)) {
          setRoomChatMessages((prev) => {
            if (!prev) {
              return [
                {
                  messageId: newMessage.messageId,
                  senderId: newMessage.senderId,
                  senderFullName: newMessage.senderFullName,
                  senderAvatarUrl: newMessage.senderAvatarUrl,
                  senderTeam:
                    newMessage.channel === RoomChatChannel.TeamA
                      ? 1
                      : newMessage.channel === RoomChatChannel.TeamB
                        ? 2
                        : 0,
                  messageText: newMessage.messageText,
                  sentAt: newMessage.sentAt,
                  isEdited: false,
                },
              ];
            }
            const exists = prev.some(
              (m) => m.messageId === newMessage.messageId,
            );
            if (exists) return prev;
            return [
              ...prev,
              {
                messageId: newMessage.messageId,
                senderId: newMessage.senderId,
                senderFullName: newMessage.senderFullName,
                senderAvatarUrl: newMessage.senderAvatarUrl,
                senderTeam:
                  newMessage.channel === RoomChatChannel.TeamA
                    ? 1
                    : newMessage.channel === RoomChatChannel.TeamB
                      ? 2
                      : 0,
                messageText: newMessage.messageText,
                sentAt: newMessage.sentAt,
                isEdited: false,
              },
            ];
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

    onRoomMessagesLoaded: useCallback(
      (payload: RoomMessagesPayload) => {
        if (payload.messages && payload.messages.length > 0) {
          setRoomChatMessages((prev) => {
            const existingIds = new Set(prev?.map((m) => m.messageId) || []);
            const newMessages = payload.messages
              .filter((m: RoomMessage) => !existingIds.has(m.messageId))
              .map((m: RoomMessage) => ({
                messageId: m.messageId,
                senderId: m.senderId,
                senderFullName: m.senderFullName,
                senderAvatarUrl: m.senderAvatarUrl,
                senderTeam:
                  m.channel === RoomChatChannel.TeamA
                    ? 1
                    : m.channel === RoomChatChannel.TeamB
                      ? 2
                      : 0,
                messageText: m.messageText,
                sentAt: m.sentAt,
                isEdited: false,
              }));
            return [...(prev || []), ...newMessages];
          });
        }
      },
      [setRoomChatMessages],
    ),

    onUserTyping: useCallback(
      (payload: RoomTypingPayload) => {
        if (
          payload.channel === (currentChannel as number) &&
          payload.userId !== currentUser
        ) {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.set(payload.userId, payload);
            return newMap;
          });

          if (typingTimeoutRef.current.has(payload.userId)) {
            clearTimeout(typingTimeoutRef.current.get(payload.userId)!);
          }
          const timeout = setTimeout(() => {
            setTypingUsers((prev) => {
              const newMap = new Map(prev);
              newMap.delete(payload.userId);
              return newMap;
            });
            typingTimeoutRef.current.delete(payload.userId);
          }, 3000);
          typingTimeoutRef.current.set(payload.userId, timeout);
        }
      },
      [currentChannel, currentUser],
    ),

    onUserStopTyping: useCallback(
      (payload: RoomStopTypingPayload) => {
        if (
          payload.channel === (currentChannel as number) &&
          payload.userId !== currentUser
        ) {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            newMap.delete(payload.userId);
            return newMap;
          });
          if (typingTimeoutRef.current.has(payload.userId)) {
            clearTimeout(typingTimeoutRef.current.get(payload.userId)!);
            typingTimeoutRef.current.delete(payload.userId);
          }
        }
      },
      [currentChannel, currentUser],
    ),
  });

  // SignalR connection
  const {
    isConnected,
    sendRoomMessage,
    getRoomMessages,
    roomTyping,
    roomStopTyping,
    switchTeamChat,
  } = useMatchRoomSignalR(signalRHandlers);

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

  // Load messages từ SignalR khi channel thay đổi
  useEffect(() => {
    if (isConnected && roomId) {
      const teamAssignment =
        currentChannel === RoomChatChannel.TeamA
          ? "A"
          : currentChannel === RoomChatChannel.TeamB
            ? "B"
            : "Unassigned";
      switchTeamChat(teamAssignment);
      getRoomMessages(currentChannel, 1, 50);
      hasScrolledToBottomRef.current = false;
    }
  }, [currentChannel, isConnected, roomId, switchTeamChat, getRoomMessages]);

  // Cleanup typing timeouts
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

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
      setMessage(text);

      const now = Date.now();
      if (now - lastTypingTimeRef.current > 2000) {
        if (isConnected && text.trim().length > 0) {
          roomTyping(currentChannel);
          lastTypingTimeRef.current = now;
        }
      }

      const timeout = setTimeout(() => {
        if (isConnected) {
          roomStopTyping(currentChannel);
        }
      }, 3000);

      if (typingTimeoutRef.current.has("self")) {
        clearTimeout(typingTimeoutRef.current.get("self")!);
      }
      typingTimeoutRef.current.set("self", timeout);
    },
    [isConnected, currentChannel, roomTyping, roomStopTyping],
  );

  // Handle send message
  const handleSend = async () => {
    if (!message.trim() || !roomId || isSending) return;

    if (isConnected) {
      roomStopTyping(currentChannel);
    }

    try {
      await sendRoomChatMessage({
        roomId,
        channel: currentChannel.toString(),
        messageText: message.trim(),
      });

      setMessage("");

      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
        isAtBottomRef.current = true;
      }, 100);
    } catch (e) {
      console.error("❌ sendRoomChatMessage error:", e);
    }
  };

  // Typing indicator text
  const typingIndicatorText = useMemo(() => {
    if (typingUsers.size === 0) return null;
    const users = Array.from(typingUsers.values());
    if (users.length === 1) {
      return `${users[0].userName} đang gõ...`;
    }
    return `${users.length} người đang gõ...`;
  }, [typingUsers]);

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
            {roomData?.venueName || "Room Chat"}
          </ThemedText>
        </View>

        {/* Channel Selector */}
        <View style={styles.channelSelector}>
          <TouchableOpacity
            style={[
              styles.channelButton,
              {
                backgroundColor:
                  currentChannel === RoomChatChannel.All
                    ? theme.colors.neonGreen + "20"
                    : "transparent",
              },
            ]}
            onPress={() => setCurrentChannel(RoomChatChannel.All)}
          >
            <ThemedText
              size="xs"
              weight={
                currentChannel === RoomChatChannel.All ? "bold" : "medium"
              }
              style={{
                color:
                  currentChannel === RoomChatChannel.All
                    ? theme.colors.neonGreen
                    : theme.colors.textSecondary,
              }}
            >
              Tất cả
            </ThemedText>
          </TouchableOpacity>

          {userTeamAssignment === "A" && (
            <TouchableOpacity
              style={[
                styles.channelButton,
                {
                  backgroundColor:
                    currentChannel === RoomChatChannel.TeamA
                      ? theme.colors.neonGreen + "20"
                      : "transparent",
                },
              ]}
              onPress={() => setCurrentChannel(RoomChatChannel.TeamA)}
            >
              <ThemedText
                size="xs"
                weight={
                  currentChannel === RoomChatChannel.TeamA
                    ? "bold"
                    : "medium"
                }
                style={{
                  color:
                    currentChannel === RoomChatChannel.TeamA
                      ? theme.colors.neonGreen
                      : theme.colors.textSecondary,
                }}
              >
                Team A
              </ThemedText>
            </TouchableOpacity>
          )}

          {userTeamAssignment === "B" && (
            <TouchableOpacity
              style={[
                styles.channelButton,
                {
                  backgroundColor:
                    currentChannel === RoomChatChannel.TeamB
                      ? theme.colors.neonGreen + "20"
                      : "transparent",
                },
              ]}
              onPress={() => setCurrentChannel(RoomChatChannel.TeamB)}
            >
              <ThemedText
                size="xs"
                weight={
                  currentChannel === RoomChatChannel.TeamB
                    ? "bold"
                    : "medium"
                }
                style={{
                  color:
                    currentChannel === RoomChatChannel.TeamB
                      ? theme.colors.neonGreen
                      : theme.colors.textSecondary,
                }}
              >
                Team B
              </ThemedText>
            </TouchableOpacity>
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
              message.trim() && !isSending
                ? "#000"
                : theme.colors.textSecondary
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

