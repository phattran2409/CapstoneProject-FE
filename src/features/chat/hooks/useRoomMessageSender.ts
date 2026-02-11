import { useCallback } from "react";
import type { RoomChatChannel } from "@/shared/hooks/useMatchRoomSignalR";
import type { RoomChatMessage } from "../types/chat.types";
import { addMessageIfNotExists } from "../utils/roomChatHelpers";

interface UseRoomMessageSenderProps {
  roomId: string;
  currentChannel: RoomChatChannel;
  isSignalRReady: boolean;
  sendRoomMessage: (
    channel: RoomChatChannel,
    messageText: string,
  ) => Promise<void>;
  sendRoomChatMessage: (params: {
    roomId: string;
    channel: string;
    messageText: string;
  }) => Promise<any>; // Using any to match SendChatMessageRoomData
  setRoomChatMessages: React.Dispatch<React.SetStateAction<RoomChatMessage[]>>;
  onMessageSent?: () => void;
}

export const useRoomMessageSender = ({
  roomId,
  currentChannel,
  isSignalRReady,
  sendRoomMessage,
  sendRoomChatMessage,
  setRoomChatMessages,
  onMessageSent,
}: UseRoomMessageSenderProps) => {
  // Add message from REST API response to local state
  const addMessageFromResponse = useCallback(
    (response: RoomChatMessage) => {
      setRoomChatMessages((prev) => {
        return addMessageIfNotExists(prev, {
          messageId: response.messageId,
          senderId: response.senderId,
          senderFullName: response.senderFullName,
          senderAvatarUrl: response.senderAvatarUrl,
          senderTeam: response.senderTeam ?? 0,
          messageText: response.messageText,
          sentAt: response.sentAt,
          isEdited: response.isEdited ?? false,
        });
      });
    },
    [setRoomChatMessages],
  );

  // Send message via REST API
  const sendViaRestAPI = useCallback(
    async (messageText: string) => {
      const response = await sendRoomChatMessage({
        roomId,
        channel: currentChannel.toString(),
        messageText,
      });

      if (response) {
        addMessageFromResponse(response);
      }
    },
    [roomId, currentChannel, sendRoomChatMessage, addMessageFromResponse],
  );

  // Send message (SignalR with REST API fallback)
  const sendMessage = useCallback(
    async (messageText: string) => {
      if (!messageText.trim() || !roomId) return;

      try {
        if (isSignalRReady) {
          try {
            // Try SignalR first
            await sendRoomMessage(currentChannel, messageText);
          } catch (signalRError) {
            console.error("❌ SignalR send error:", signalRError);
            // Fallback to REST API
            await sendViaRestAPI(messageText);
          }
        } else {
          // Use REST API if SignalR not ready
          await sendViaRestAPI(messageText);
        }

        onMessageSent?.();
      } catch (error) {
        console.error("❌ sendRoomChatMessage error:", error);
        throw error;
      }
    },
    [
      roomId,
      isSignalRReady,
      currentChannel,
      sendRoomMessage,
      sendViaRestAPI,
      onMessageSent,
    ],
  );

  return {
    sendMessage,
  };
};
