import { useQuery } from "@tanstack/react-query";
import { friendKeys } from "../api/friendKeys";
import { getFriendshipStatus } from "../api/friendsApi";

interface UseGetFriendshipStatusOptions {
  userId: string;
  enabled?: boolean;
}

export const useGetFriendshipStatus = ({
  userId,
  enabled = true,
}: UseGetFriendshipStatusOptions) => {
  const query = useQuery({
    queryKey: friendKeys.status(userId),
    queryFn: () => getFriendshipStatus(userId),
    enabled: enabled && !!userId,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });

  return {
    friendshipStatus: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
};
