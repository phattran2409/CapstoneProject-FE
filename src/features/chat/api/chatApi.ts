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
import { API_CONFIG } from "@/shared/constants/api";


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
    API_CONFIG.ENDPOINTS.CHAT.CONVERSATIONS,
    { params: { searchTerm, page, pageSize } },
  )) as unknown as ChatApiResponse<ConversationListData>;

  return res.data;
};

export const getConversationMessages = async (
  otherUserId: string,
  pageNumber = 1,
  pageSize = 50,
): Promise<ConversationDetailData> => {
  const url = API_CONFIG.ENDPOINTS.CHAT.CONVERSATION.replace(':userId', otherUserId);
  const res = (await apiClient.get<ChatApiResponse<ConversationDetailData>>(
    url,
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
  const url = API_CONFIG.ENDPOINTS.CHAT.ROOM_MESSAGES.replace(':roomId', roomId);
  const res = (await apiClient.get<ChatApiResponse<RoomChatDetailData>>(
    url,
    { params: { channel, pageNumber, pageSize } },
  )) as unknown as ChatApiResponse<RoomChatDetailData>;

  return res.data;
};

export const sendChatMessageRoom = async (
  payload: SendChatRoomRequestBody,
): Promise<SendChatMessageRoomData> => {
  const res = (await apiClient.post<ChatApiResponse<SendChatMessageRoomData>>(
    API_CONFIG.ENDPOINTS.CHAT.ROOM_SEND,
    payload,
  )) as unknown as ChatApiResponse<SendChatMessageRoomData>;
  return res.data;
};

export const sendChatMessage = async (
  payload: SendChatRequestBody,
): Promise<SendChatMessageData> => {
  const res = (await apiClient.post<ChatApiResponse<SendChatMessageData>>(
    API_CONFIG.ENDPOINTS.CHAT.SEND,
    payload,
  )) as unknown as ChatApiResponse<SendChatMessageData>;
  return res.data;
};

export const markChatAsRead = async (
  fromUserId: string,
): Promise<MarkAsReadData> => {
  const url = API_CONFIG.ENDPOINTS.CHAT.READ.replace(':fromUserId', fromUserId);
  const res = (await apiClient.post<ChatApiResponse<MarkAsReadData>>(
    url,
  )) as unknown as ChatApiResponse<MarkAsReadData>;
  return res.data;
};
