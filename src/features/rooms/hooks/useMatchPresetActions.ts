import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';
import type { CreateMatchPresetDto, UpdateMatchPresetDto } from '../types/room.types';

/**
 * GET /match-presets/:id — chi tiết preset theo ID.
 * Chỉ fetch khi enabled=true và id tồn tại.
 */
export function useMatchPresetById(
  id: string | undefined,
  options?: { enabled?: boolean },
) {
  const allowFetch = options?.enabled ?? true;
  return useQuery({
    queryKey: roomsKeys.matchPresetDetail(id ?? ''),
    queryFn: () => roomsApi.getMatchPresetById(id!),
    enabled: !!id && allowFetch,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * PUT /match-presets/:id — cập nhật preset theo ID.
 * Tự động invalidate detail + list sau khi thành công.
 */
export function useUpdateMatchPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMatchPresetDto }) =>
      roomsApi.updateMatchPreset(id, dto),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchPresetDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchPresetList() });
    },
  });
}

/**
 * POST /match-presets — tạo preset mới từ CreateRoom form.
 * Tự động invalidate list sau khi thành công.
 */
export function useCreateMatchPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateMatchPresetDto) => roomsApi.createMatchPreset(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchPresetList() });
    },
  });
}

/**
 * DELETE /match-presets/:id — xoá preset theo ID.
 * Tự động invalidate list sau khi thành công.
 */
export function useDeleteMatchPreset() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => roomsApi.deleteMatchPreset(id),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: roomsKeys.matchPresetDetail(id) });
      queryClient.invalidateQueries({ queryKey: roomsKeys.matchPresetList() });
    },
  });
}
