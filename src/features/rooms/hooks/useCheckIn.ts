import { useMutation } from '@tanstack/react-query';
import { roomsApi } from '../api/roomsApi';
import type { CheckInRequest, CheckInResponse } from '../types/room.types';

/**
 * Hook thực hiện check-in GPS tại sân
 * POST /api/match-rooms/{id}/check-in
 */
export const useCheckIn = () => {
  return useMutation<CheckInResponse, Error, { roomId: string; payload: CheckInRequest }>({
    mutationFn: ({ roomId, payload }) => roomsApi.checkIn(roomId, payload),
  });
};
