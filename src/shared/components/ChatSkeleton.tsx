import React from "react";
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/shared/theme";
import { Skeleton } from "./Skeleton";

interface ChatSkeletonProps {
  /**
   * Number of message pairs to display (default: 4)
   */
  messageCount?: number;
}

export const ChatSkeleton: React.FC<ChatSkeletonProps> = ({
  messageCount = 4,
}) => {
  const { theme } = useTheme();

  const renderOwnMessage = (index: number) => (
    <View
      key={`own-${index}`}
      style={[
        styles.messageContainer,
        styles.ownMessageContainer,
        { marginBottom: theme.spacing.m },
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          styles.ownMessageBubble,
          {
            backgroundColor: theme.colors.border,
            borderRadius: theme.radius.m,
            padding: theme.spacing.m,
            maxWidth: "75%",
          },
        ]}
      >
        {/* Message text lines */}
        <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
        <Skeleton width="80%" height={14} />
      </View>
      {/* Timestamp */}
      <View style={{ marginTop: 4, alignItems: "flex-end" }}>
        <Skeleton width={50} height={10} />
      </View>
    </View>
  );

  const renderOtherMessage = (index: number, isLong: boolean = false) => (
    <View
      key={`other-${index}`}
      style={[
        styles.messageContainer,
        styles.otherMessageContainer,
        { marginBottom: theme.spacing.m },
      ]}
    >
      {/* Avatar */}
      <View style={{ marginRight: theme.spacing.s }}>
        <Skeleton variant="circular" width={32} height={32} />
      </View>

      <View style={{ flex: 1 }}>
        <View
          style={[
            styles.messageBubble,
            styles.otherMessageBubble,
            {
              backgroundColor: theme.colors.border,
              borderRadius: theme.radius.m,
              padding: theme.spacing.m,
              maxWidth: "75%",
            },
          ]}
        >
          {/* Message text lines */}
          <Skeleton width="100%" height={14} style={{ marginBottom: 6 }} />
          {isLong && (
            <Skeleton width="90%" height={14} style={{ marginBottom: 6 }} />
          )}
          <Skeleton width={isLong ? "60%" : "70%"} height={14} />
        </View>
        {/* Timestamp */}
        <View style={{ marginTop: 4 }}>
          <Skeleton width={50} height={10} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { padding: theme.spacing.m }]}>
      {Array.from({ length: messageCount }).map((_, index) => (
        <React.Fragment key={index}>
          {/* Other user's message */}
          {renderOtherMessage(index * 2, index % 3 === 0)}

          {/* Own message */}
          {renderOwnMessage(index * 2 + 1)}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: "row",
  },
  ownMessageContainer: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  messageBubble: {
    overflow: "hidden",
  },
  ownMessageBubble: {
    alignSelf: "flex-end",
  },
  otherMessageBubble: {
    alignSelf: "flex-start",
  },
});

export default ChatSkeleton;
