import { useMutation, useQueryClient } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import { roomsKeys } from '../api/roomsKeys';

/**
 * POST /match-rooms/:id/transfer-host
 * Gửi yêu cầu chuyển quyền host sang người chơi khác.
 * Invalidate room detail để cập nhật hostId sau khi thành công.
 */
export function useTransferHost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roomId, targetUserId }: { roomId: string; targetUserId: string }) =>
      roomsApi.transferHost(roomId, targetUserId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(variables.roomId) });
    },
  });
}

export function useResponseTransferHost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({roomId, isAccepted}: {roomId: string; isAccepted: boolean}) => roomsApi.responseTransferHost(roomId, isAccepted),
    onSuccess: (_data, {roomId}) => {
      queryClient.invalidateQueries({ queryKey: roomsKeys.detail(roomId) });
    },
  });
}