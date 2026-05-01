import { useMutation } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import type { SuggestPlayersRequest, SuggestRoomsRequest } from '../types/room.types';

export const useSuggestAI = () => {
  return useMutation({
    mutationFn: (payload: SuggestRoomsRequest) => roomsApi.suggestRooms(payload),
  });
};

export const useSuggestPlayers = () => {
  return useMutation({
    mutationFn: (payload: SuggestPlayersRequest) => roomsApi.suggestPlayers(payload),
  });
};