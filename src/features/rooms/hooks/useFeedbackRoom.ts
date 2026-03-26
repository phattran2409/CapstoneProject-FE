import { useMutation, useQueryClient } from "@tanstack/react-query";
import { roomsApi } from "../api/roomsApi";
import { roomsKeys } from "../api/roomsKeys";

export interface VoteResult {
  roomId: string;
  vote: string;
}

export const useVoteResult = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (args: VoteResult) =>
      roomsApi.voteResult(args.roomId, args.vote),
    onSuccess: (_data, args) => {
      queryClient.invalidateQueries({
        queryKey: roomsKeys.detail(args.roomId),
      });
    },
  });
};
