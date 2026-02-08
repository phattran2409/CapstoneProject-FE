import { apiClient } from "@/shared/api/client";
import type {
  ChatApiResponse,
  ConversationListData,
  ConversationDetailData,
  SendChatRequestBody,
  SendChatMessageData,
  MarkAsReadData,
  SendChatRoomRequestBody,
  SendChatMessageRoomData,
  RoomChatDetailData,
} from "../types/chat.types";


export interface GetConversationsParams {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
}

export const getConversations = async (
  params: GetConversationsParams = {},
): Promise<ConversationListData> => {
  const { page = 1, pageSize = 20, searchTerm } = params;

  const res = (await apiClient.get<ChatApiResponse<ConversationListData>>(
    "/chat/conversations",
    { params: { searchTerm, page, pageSize } },
  )) as unknown as ChatApiResponse<ConversationListData>;

  return res.data;
};

export const getConversationMessages = async (
  otherUserId: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<ConversationDetailData> => {
  const res = (await apiClient.get<ChatApiResponse<ConversationDetailData>>(
    `/chat/conversation/${otherUserId}`,
    { params: { pageNumber, pageSize } },
  )) as unknown as ChatApiResponse<ConversationDetailData>;

  return res.data;
};

export const getRoomChat = async (
  roomId: string,
  channel: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<RoomChatDetailData> => {
  const res = (await apiClient.get<ChatApiResponse<RoomChatDetailData>>(
    `/chat/room/${roomId}/messages`,
    { params: { channel, pageNumber, pageSize } },
  )) as unknown as ChatApiResponse<RoomChatDetailData>;

  return res.data;
};

export const sendChatMessageRoom = async (
  payload: SendChatRoomRequestBody,
): Promise<SendChatMessageRoomData> => {
  const res = (await apiClient.post<ChatApiResponse<SendChatMessageRoomData>>(
    "/chat/room/send",
    payload,
  )) as unknown as ChatApiResponse<SendChatMessageRoomData>;
  return res.data;
};

export const sendChatMessage = async (
  payload: SendChatRequestBody,
): Promise<SendChatMessageData> => {
  const res = (await apiClient.post<ChatApiResponse<SendChatMessageData>>(
    "/chat/send",
    payload,
  )) as unknown as ChatApiResponse<SendChatMessageData>;
  return res.data;
};

export const markChatAsRead = async (
  fromUserId: string,
): Promise<MarkAsReadData> => {
  const res = (await apiClient.post<ChatApiResponse<MarkAsReadData>>(
    `/chat/read/${fromUserId}`,
  )) as unknown as ChatApiResponse<MarkAsReadData>;
  return res.data;
};

