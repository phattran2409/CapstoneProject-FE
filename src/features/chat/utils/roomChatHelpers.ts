import type { RoomMessage } from "@/shared/hooks/useMatchRoomSignalR";
import type { RoomChatMessage } from "../types/chat.types";

/**
 * Convert team assignment string to number
 * @param team - Team assignment ("A" | "B" | "Unassigned" | null)
 * @returns Team number (1 for A, 2 for B, 0 for unassigned)
 */
export const teamAssignmentToNumber = (
  team: "A" | "B" | "Unassigned" | null | undefined,
): number => {
  if (team === "A") return 1;
  if (team === "B") return 2;
  return 0; // "Unassigned", null, or undefined
};

/**
 * Transform RoomMessage from SignalR to RoomChatMessage format
 * @param message - RoomMessage from SignalR
 * @returns RoomChatMessage for local state
 */
export const transformRoomMessage = (
  message: RoomMessage,
): RoomChatMessage => ({
  messageId: message.messageId,
  senderId: message.senderId,
  senderFullName: message.senderFullName,
  senderAvatarUrl: message.senderAvatarUrl,
  senderTeam: teamAssignmentToNumber(message.senderTeam),
  messageText: message.messageText,
  sentAt: message.sentAt,
  isEdited: false,
});

/**
 * Check if a message already exists in the list
 * @param messages - Current message list
 * @param messageId - Message ID to check
 * @returns true if message exists
 */
export const messageExists = (
  messages: RoomChatMessage[],
  messageId: string,
): boolean => {
  return messages.some((m) => m.messageId === messageId);
};

/**
 * Add a new message to the list if it doesn't exist
 * @param messages - Current message list
 * @param newMessage - New message to add
 * @returns Updated message list
 */
export const addMessageIfNotExists = (
  messages: RoomChatMessage[],
  newMessage: RoomChatMessage,
): RoomChatMessage[] => {
  if (messageExists(messages, newMessage.messageId)) {
    return messages;
  }
  return [...messages, newMessage];
};
