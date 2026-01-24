import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface UsePaginationOptions<T> {
  queryKey: readonly unknown[];
  fetchFunction: (
    page: number,
    pageSize: number,
  ) => Promise<{
    data: T[];
    totalPages: number;
    totalCount: number;
  }>;
  pageSize?: number;
  staleTime?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

interface UsePaginationResult<T> {
  data: T[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  hasMore: boolean;
  refresh: () => void;
  loadMore: () => void;
  setData: React.Dispatch<React.SetStateAction<T[]>>;
}

export function usePagination<T>({
  queryKey,
  fetchFunction,
  pageSize = 10,
  staleTime = 5 * 60 * 1000, // 5 minutes default
  enabled = true,
  onError,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const queryClient = useQueryClient();

  // Local state for accumulated data and pagination
  const [accumulatedData, setAccumulatedData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Track if this is initial load
  const isInitialLoad = useRef(true);

  // Create query key with page
  const paginatedQueryKey = [...queryKey, { page: currentPage, pageSize }];

  // Main query for current page
  const {
    data: queryData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: paginatedQueryKey,
    queryFn: () => fetchFunction(currentPage, pageSize),
    staleTime,
    enabled,
  });

  // Handle query data changes
  useEffect(() => {
    if (queryData) {
      setTotalPages(queryData.totalPages);

      if (isInitialLoad.current) {
        // Initial load - replace data
        setAccumulatedData(queryData.data);
        isInitialLoad.current = false;
      } else if (isRefreshing) {
        // Refresh - replace data and reset
        setAccumulatedData(queryData.data);
        setIsRefreshing(false);
      } else if (isLoadingMore) {
        // Load more - append data
        setAccumulatedData((prev) => [...prev, ...queryData.data]);
        setIsLoadingMore(false);
      } else if (currentPage === 1) {
        // Page 1 refetch (e.g., from cache invalidation)
        setAccumulatedData(queryData.data);
      }
    }
  }, [queryData, isRefreshing, isLoadingMore, currentPage]);

  // Handle errors
  useEffect(() => {
    if (queryError) {
      onError?.(queryError as Error);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [queryError, onError]);

  // Refresh function - reset to page 1 and refetch
  const refresh = useCallback(() => {
    setIsRefreshing(true);
    setCurrentPage(1);
    isInitialLoad.current = false;

    // Invalidate all pages for this query
    queryClient.invalidateQueries({
      queryKey,
      exact: false,
    });

    // If already on page 1, manually refetch
    if (currentPage === 1) {
      refetch();
    }
  }, [queryClient, queryKey, currentPage, refetch]);

  // Load more function - increment page
  const loadMore = useCallback(() => {
    if (!isFetching && !isLoadingMore && currentPage < totalPages) {
      setIsLoadingMore(true);
      setCurrentPage((prev) => prev + 1);
    }
  }, [isFetching, isLoadingMore, currentPage, totalPages]);

  // Determine loading states
  const loading = isLoading && isInitialLoad.current;
  const refreshing = isRefreshing && isFetching;
  const loadingMore = isLoadingMore;

  // Error message
  const errorMessage = queryError
    ? (queryError as Error).message || "Không thể tải dữ liệu"
    : null;

  return {
    data: accumulatedData,
    loading,
    refreshing,
    loadingMore,
    error: errorMessage,
    page: currentPage,
    totalPages,
    hasMore: currentPage < totalPages,
    refresh,
    loadMore,
    setData: setAccumulatedData,
  };
}
