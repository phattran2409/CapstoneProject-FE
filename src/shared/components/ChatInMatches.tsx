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
  Keyboard,
  StyleSheet,
} from "react-native";
import { useTheme } from "../theme";
import { ThemedText, ThemedView, ThemedIcon } from "./themed";
import { MessageList, Message, MessageListRef, TypingIndicator } from "./";
import { getRelativeTime } from "../utils/dateUtils";
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
import type { MatchRoomFullInfo } from "@/features/rooms/types/room.types";

interface ChatInMatchesProps {
  roomId: string;
  currentUserId?: string;
  maxHeight?: number;
  showHeader?: boolean;
  roomData?: MatchRoomFullInfo | null;
  // Channel hiện tại (All, TeamA, TeamB)
  initialChannel?: RoomChatChannel;
}

const ChatInMatches: React.FC<ChatInMatchesProps> = ({
  roomId,
  currentUserId,
  maxHeight = 400,
  showHeader = true,
  roomData,
  initialChannel = RoomChatChannel.All,
}) => {
  const { theme } = useTheme();
  const { user } = useAuthStore();
  const currentUser = currentUserId || user?.userId || "";

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
  // Mặc định: Team A → TeamA channel, Team B → TeamB channel, Unassigned → All channel
  const getDefaultChannel = useCallback((): RoomChatChannel => {
    if (userTeamAssignment === "A") return RoomChatChannel.TeamA;
    if (userTeamAssignment === "B") return RoomChatChannel.TeamB;
    return RoomChatChannel.All; // Unassigned hoặc chưa có team
  }, [userTeamAssignment]);

  const [currentChannel, setCurrentChannel] = useState<RoomChatChannel>(() => {
    // Nếu có initialChannel và user chưa có team assignment, dùng initialChannel
    // Ngược lại, dùng channel mặc định theo team assignment
    return initialChannel || getDefaultChannel();
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
  // Logic: Channel tự động thay đổi khi join/leave team
  useEffect(() => {
    const defaultChannel = getDefaultChannel();
    // Chỉ auto switch khi team assignment thay đổi (không phải khi user tự đổi channel)
    // Nếu channel hiện tại không phù hợp với team assignment mới → auto switch
    if (currentChannel !== defaultChannel) {
      // Kiểm tra xem có phải do team assignment thay đổi không
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
    //không cho current chanel vì user có quyền thay đổi channel
  }, [userTeamAssignment, getDefaultChannel]);

  // SignalR handlers
  const signalRHandlers = useMatchRoomSignalRHandlers({
    roomId,
    currentUserId: currentUser,
    // Handle khi participant updated (join/leave team)
    onParticipantUpdated: useCallback(
      (payload: ParticipantUpdatedPayload) => {
        // Nếu là current user thay đổi team → auto switch channel
        if (payload.userId === currentUser) {
          const newChannel =
            payload.teamAssignment === "A"
              ? RoomChatChannel.TeamA
              : payload.teamAssignment === "B"
                ? RoomChatChannel.TeamB
                : RoomChatChannel.All; // Unassigned
          setCurrentChannel(newChannel);
        }
      },
      [currentUser],
    ),
    // Room chat callbacks
    onNewRoomMessage: useCallback(
      (newMessage: RoomMessage) => {
        // Chỉ thêm message nếu đúng channel (so sánh number với enum)
        if (newMessage.channel === (currentChannel as number)) {
          setRoomChatMessages((prev) => {
            if (!prev) {
              // RoomMessage từ backend đã có đúng format, chỉ cần convert channel và thêm senderTeam
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
            // Kiểm tra message đã tồn tại chưa (tránh duplicate)
            const exists = prev.some(
              (m) => m.messageId === newMessage.messageId,
            );
            if (exists) return prev;
            // RoomMessage từ backend đã có đúng format
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

          // Auto scroll nếu đang ở bottom
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
        // Khi nhận messages từ SignalR (pagination)
        if (payload.messages && payload.messages.length > 0) {
          setRoomChatMessages((prev) => {
            // Merge với messages hiện tại, tránh duplicate
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
        // Chỉ hiển thị typing nếu đúng channel và không phải current user
        // So sánh number với enum
        if (
          payload.channel === (currentChannel as number) &&
          payload.userId !== currentUser
        ) {
          setTypingUsers((prev) => {
            const newMap = new Map(prev);
            // Lưu payload với userName để hiển thị
            newMap.set(payload.userId, payload);
            return newMap;
          });

          // Clear typing sau 3 giây
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
        // RoomStopTypingPayload không có userName, chỉ có userId
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
      isRead: true, // Room chat không có read status
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
      // Switch channel trên SignalR
      const teamAssignment =
        currentChannel === RoomChatChannel.TeamA
          ? "A"
          : currentChannel === RoomChatChannel.TeamB
            ? "B"
            : "Unassigned";
      switchTeamChat(teamAssignment);

      // Load messages từ SignalR
      getRoomMessages(currentChannel, 1, 50);

      // Reset scroll
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
      // Chỉ gửi typing signal mỗi 2 giây một lần
      if (now - lastTypingTimeRef.current > 2000) {
        if (isConnected && text.trim().length > 0) {
          roomTyping(currentChannel);
          lastTypingTimeRef.current = now;
        }
      }

      // Gửi stopTyping sau 3 giây không gõ
      const timeout = setTimeout(() => {
        if (isConnected) {
          roomStopTyping(currentChannel);
        }
      }, 3000);

      // Clear timeout cũ
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

    // Gửi stopTyping khi gửi tin nhắn
    if (isConnected) {
      roomStopTyping(currentChannel);
    }

    try {
      // Gửi qua REST API (SignalR sẽ broadcast tự động)
      await sendRoomChatMessage({
        roomId,
        channel: currentChannel.toString(),
        messageText: message.trim(),
      });

      setMessage("");

      // Auto scroll sau khi gửi
      setTimeout(() => {
        messageListRef.current?.scrollToBottom(true);
        isAtBottomRef.current = true;
      }, 100);
    } catch (e) {
      console.error("❌ sendRoomChatMessage error:", e);
    }
  };

  // Get channel name
  const getChannelName = (channel: RoomChatChannel): string => {
    switch (channel) {
      case RoomChatChannel.All:
        return "Tất cả";
      case RoomChatChannel.TeamA:
        return "Team A";
      case RoomChatChannel.TeamB:
        return "Team B";
      default:
        return "Tất cả";
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
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, maxHeight }}
    >
      <ThemedView style={{ flex: 1 }}>
        {/* Chat Header */}
        {showHeader && (
          <View
            style={[
              styles.header,
              {
                borderBottomColor: theme.colors.border,
                backgroundColor: theme.colors.background,
              },
            ]}
          >
            <View style={styles.headerLeft}>
              <ThemedIcon name="chatbubbles" size={20} variant="accent" />
              <ThemedText size="m" weight="bold">
                Chat Phòng
              </ThemedText>
            </View>

            {/* Channel Selector */}
            <View style={styles.channelSelector}>
              {/* Luôn hiển thị channel "Tất cả" (general) */}
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

              {/* Chỉ hiển thị Team A channel nếu user đang ở Team A */}
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

              {/* Chỉ hiển thị Team B channel nếu user đang ở Team B */}
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
        )}

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
        <View
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
            <ThemedIcon
              name="send"
              size={20}
              color={
                message.trim() && !isSending
                  ? "#000"
                  : theme.colors.textSecondary
              }
            />
          </TouchableOpacity>
        </View>
      </ThemedView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

export default ChatInMatches;
