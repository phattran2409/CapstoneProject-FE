import React, { useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { View, Text, FlatList, ListRenderItem, TouchableOpacity, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/shared/theme";
import Ionicons from "@expo/vector-icons/Ionicons";

export interface Message {
  id: string;
  sender: string;
  senderName: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  isRead?: boolean;
  avatar?: any;
}

interface MessageListProps {
  messages: Message[];
  inverted?: boolean;
  contentContainerStyle?: any;
  loadMore?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  renderEmpty?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
  onScrollToBottom?: (isAtBottom: boolean) => void;
  onLayout?: () => void;
}

export interface MessageListRef {
  scrollToBottom: (animated?: boolean) => void;
  isAtBottom: () => boolean;
}

export const MessageList = forwardRef<MessageListRef, MessageListProps>(
  (
    {
      messages,
      inverted = false,
      contentContainerStyle,
      loadMore,
      refreshing,
      onRefresh,
      renderEmpty,
      renderFooter,
      onScrollToBottom,
      onLayout,
    },
    ref,
  ) => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const flatListRef = useRef<FlatList>(null);
    const isAtBottomRef = useRef(true);
    const lastMessageCountRef = useRef(messages.length);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      scrollToBottom: (animated = true) => {
        if (inverted) {
          // Với inverted mode, scroll đến index 0 (bottom)
          flatListRef.current?.scrollToIndex({ index: 0, animated });
        } else {
          // Với normal mode, scroll đến cuối
          flatListRef.current?.scrollToEnd({ animated });
        }
      },
      isAtBottom: () => isAtBottomRef.current,
    }));

    // Auto scroll khi có tin nhắn mới (chỉ khi đang ở bottom)
    // Note: Logic này sẽ được xử lý chủ yếu từ parent component (ChatScreen)
    // để có control tốt hơn về khi nào cần scroll
    React.useEffect(() => {
      lastMessageCountRef.current = messages.length;
    }, [messages.length]);

    const handleScroll = useCallback(
      (event: any) => {
        const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
        let isAtBottom = false;

        if (inverted) {
          // Với inverted mode, bottom là khi contentOffset.y gần 0
          const threshold = 100; // 100px threshold
          isAtBottom = contentOffset.y <= threshold;
        } else {
          // Với normal mode, bottom là khi scroll gần đến cuối
          const threshold = 100; // 100px threshold
          const distanceFromEnd = contentSize.height - (contentOffset.y + layoutMeasurement.height);
          isAtBottom = distanceFromEnd <= threshold;
        }

        if (isAtBottom !== isAtBottomRef.current) {
          isAtBottomRef.current = isAtBottom;
          onScrollToBottom?.(isAtBottom);
        }
      },
      [inverted, onScrollToBottom],
    );

    const renderMessage: ListRenderItem<Message> = useCallback(
      ({ item }) => {
        // Detect deep links in message text
        const roomLinkMatch = item.text.match(/(kickify:\/\/room\/\S+)/);
        const roomLink = roomLinkMatch?.[1];

        const postLinkMatch = item.text.match(/(kickify:\/\/post\/\S+)/);
        const postLink = postLinkMatch?.[1];

        const userLinkMatch = item.text.match(/(kickify:\/\/user\/\S+)/);
        const userLink = userLinkMatch?.[1];

        const handleDeepLink = (url: string) => {
          Linking.openURL(url).catch(() => {});
        };

        const handleJoinRoom = () => {
          if (roomLink) {
            handleDeepLink(roomLink);
          }
        };

        return (
          <View
            style={{
              flexDirection: "row",
              marginBottom: theme.spacing.m,
              paddingHorizontal: theme.spacing.m,
              justifyContent: item.isOwn ? "flex-end" : "flex-start",
            }}
          >
            {!item.isOwn && (
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: theme.colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: theme.spacing.xs,
                }}
              >
                <Ionicons name="person" size={20} color={theme.colors.text} />
              </View>
            )}
            <View style={{ flex: item.isOwn ? 0 : 1, maxWidth: "75%" }}>
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
                  backgroundColor: item.isOwn
                    ? theme.colors.neonGreen
                    : theme.colors.surface,
                  borderRadius: theme.radius.m,
                  padding: theme.spacing.s,
                  alignSelf: item.isOwn ? "flex-end" : "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: theme.fontSizes.m,
                    color: item.isOwn ? theme.colors.black : theme.colors.text,
                  }}
                >
                  {item.text}
                </Text>

                {roomLink && (
                  <TouchableOpacity
                    onPress={handleJoinRoom}
                    style={{
                      marginTop: theme.spacing.s,
                      backgroundColor: item.isOwn
                        ? theme.colors.black
                        : theme.colors.neonGreen,
                      borderRadius: theme.radius.s,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: theme.fontSizes.s,
                        fontWeight: "600",
                        color: item.isOwn ? theme.colors.neonGreen : "#000",
                      }}
                    >
                      Tham gia phòng
                    </Text>
                  </TouchableOpacity>
                )}

                {postLink && (
                  <TouchableOpacity
                    onPress={() => handleDeepLink(postLink)}
                    style={{
                      marginTop: theme.spacing.s,
                      backgroundColor: item.isOwn
                        ? theme.colors.black
                        : theme.colors.neonGreen,
                      borderRadius: theme.radius.s,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="newspaper-outline"
                      size={14}
                      color={item.isOwn ? theme.colors.neonGreen : "#000"}
                    />
                    <Text
                      style={{
                        fontSize: theme.fontSizes.s,
                        fontWeight: "600",
                        color: item.isOwn ? theme.colors.neonGreen : "#000",
                      }}
                    >
                      Xem bài viết
                    </Text>
                  </TouchableOpacity>
                )}

                {userLink && (
                  <TouchableOpacity
                    onPress={() => handleDeepLink(userLink)}
                    style={{
                      marginTop: theme.spacing.s,
                      backgroundColor: item.isOwn
                        ? theme.colors.black
                        : theme.colors.neonGreen,
                      borderRadius: theme.radius.s,
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      alignSelf: "flex-start",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="person-outline"
                      size={14}
                      color={item.isOwn ? theme.colors.neonGreen : "#000"}
                    />
                    <Text
                      style={{
                        fontSize: theme.fontSizes.s,
                        fontWeight: "600",
                        color: item.isOwn ? theme.colors.neonGreen : "#000",
                      }}
                    >
                      Xem hồ sơ
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: theme.spacing.xs,
                  alignSelf: item.isOwn ? "flex-end" : "flex-start",
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
                      {item.isRead ? t("chat.seen") : t("chat.sent")}
                    </Text>
                    <Ionicons
                      name="checkmark-done"
                      size={12}
                      color={
                        item.isRead
                          ? theme.colors.neonGreen
                          : theme.colors.textSecondary
                      }
                    />
                    <Ionicons
                      name="checkmark-done"
                      size={12}
                      color={
                        item.isRead
                          ? theme.colors.neonGreen
                          : theme.colors.textSecondary
                      }
                      style={{ marginLeft: -4 }}
                    />
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
      },
      [theme, t],
    );

    // Handle content size change để auto scroll khi content được render
    // Chỉ scroll khi có tin nhắn mới và đang ở bottom
    const handleContentSizeChange = useCallback(
      (contentWidth: number, contentHeight: number) => {
        // Chỉ scroll nếu đang ở bottom (để tránh scroll khi user đang xem tin nhắn cũ)
        // Và chỉ khi có messages (tránh scroll khi empty)
        if (isAtBottomRef.current && messages.length > 0) {
          // Delay nhỏ để đảm bảo render xong
          setTimeout(() => {
            if (inverted) {
              flatListRef.current?.scrollToIndex({ index: 0, animated: false });
            } else {
              flatListRef.current?.scrollToEnd({ animated: false });
            }
          }, 50);
        }
      },
      [inverted, messages.length],
    );

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={
          contentContainerStyle || { paddingVertical: theme.spacing.m }
        }
        inverted={inverted}
        removeClippedSubviews={false}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={20}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        onLayout={onLayout}
        onScrollToIndexFailed={(info) => {
          // Fallback nếu scrollToIndex fail
          setTimeout(() => {
            if (inverted) {
              flatListRef.current?.scrollToOffset({
                offset: 0,
                animated: true,
              });
            } else {
              flatListRef.current?.scrollToEnd({ animated: true });
            }
          }, 100);
        }}
      />
    );
  },
);

MessageList.displayName = "MessageList";
