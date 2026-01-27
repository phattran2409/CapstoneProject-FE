import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendKeys } from "../api/friendKeys";
import { respondToFriendRequest, removeFriend } from "../api/friendsApi";

interface RespondToFriendRequestParams {
  requesterId: string;
  accept: boolean;
}

export const useRespondToFriendRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requesterId, accept }: RespondToFriendRequestParams) =>
      respondToFriendRequest(requesterId, accept),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.requests() });
      if (data.status === "Accepted") {
        queryClient.invalidateQueries({ queryKey: friendKeys.list() });
      }
      console.log(
        `Friend request ${variables.accept ? "Accepted" : "Rejected"}:`,
        data,
      );
    },
    onError: (error, variables) => {
      console.error(
        `Failed to ${variables.accept ? "Accept" : "Reject"} friend request:`,
        error,
      );
    },
  });
};

export const useRemoveFriend = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => removeFriend(userId),
    onSuccess: (data, userId) => {
      queryClient.invalidateQueries({ queryKey: friendKeys.list() });
      queryClient.invalidateQueries({ queryKey: friendKeys.status(userId) });

      console.log("Friend removed successfully:", data);
    },
    onError: (error, userId) => {
      console.error(`Failed to remove friend ${userId}:`, error);
    },
  });
};
