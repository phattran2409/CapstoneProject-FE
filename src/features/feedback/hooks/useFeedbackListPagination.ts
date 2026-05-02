import { usePagination } from "@/shared/hooks";

type FeedbackListFilters = {
  fromDate?: string;
  toDate?: string;
  rating?: number;
};

export interface FeedbackListPaginationOptions {
  pageSize?: number;
  enabled?: boolean;
  fromDate?: string;
  toDate?: string;
  rating?: number;
}

interface FeedbackFetchResult<TItem> {
  data: TItem[];
  totalPages?: number;
  totalCount?: number;
}

export const useFeedbackListPagination = <TItem>({
  pageSize,
  enabled = true,
  fromDate,
  toDate,
  rating,
  queryKey,
  fetchFunction,
  staleTime = 2 * 60 * 1000,
  onError,
}: {
  pageSize?: number;
  enabled?: boolean;
  fromDate?: string;
  toDate?: string;
  rating?: number;
  queryKey: (filters: FeedbackListFilters) => readonly unknown[];
  fetchFunction: (args: {
    page: number;
    pageSize: number;
    filters: FeedbackListFilters;
  }) => Promise<FeedbackFetchResult<TItem>>;
  staleTime?: number;
  onError?: (error: Error) => void;
}) => {
  const filters = { fromDate, toDate, rating };

  return usePagination<TItem>({
    queryKey: queryKey(filters),
    fetchFunction: async (page, size) => {
      const result = await fetchFunction({ page, pageSize: size, filters });
      return {
        data: result.data,
        totalPages: result.totalPages ?? 0,
        totalCount: result.totalCount ?? 0,
      };
    },
    pageSize,
    staleTime,
    enabled,
    onError,
  });
};

