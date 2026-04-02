import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { MatchRoomCreatePresetDto } from '../types/room.types';

export function useMatchRoomCreatePreset() {
  return useQuery({
    queryKey: roomsKeys.createPreset(),
    queryFn: () => roomsApi.getCreateRoomPreset(),
  });
}

export function useUpsertMatchRoomCreatePreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: MatchRoomCreatePresetDto) =>
      roomsApi.upsertCreateRoomPreset(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.createPreset() });
    },
  });
}
