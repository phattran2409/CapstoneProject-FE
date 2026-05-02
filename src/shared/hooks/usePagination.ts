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

interface PaginationQueryData<T> {
  data: T[];
  totalPages: number;
  totalCount: number;
  page: number;
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
  const pendingPageRef = useRef<number | null>(null);

  // Khi queryKey đổi (search/filter): reset ngay về trang 1 và clear data trong cùng render
  // để fetch đúng page 1 và không giữ cache/dữ liệu cũ
  const queryKeySerialized = JSON.stringify(queryKey);
  const prevQueryKeyRef = useRef(queryKeySerialized);
  const isKeyChanged = prevQueryKeyRef.current !== queryKeySerialized;
  if (isKeyChanged) {
    prevQueryKeyRef.current = queryKeySerialized;
    isInitialLoad.current = true;
    pendingPageRef.current = null;
  }

  const effectivePage = isKeyChanged ? 1 : currentPage;
  const effectiveData = isKeyChanged ? [] : accumulatedData;

  // Sync state khi queryKey đổi (setState để lần render sau currentPage/accumulatedData khớp)
  useEffect(() => {
    setAccumulatedData([]);
    setCurrentPage(1);
    setIsRefreshing(false);
    setIsLoadingMore(false);
    pendingPageRef.current = null;
    isInitialLoad.current = true;
  }, [queryKeySerialized]);

  // Create query key with page (dùng effectivePage để fetch đúng trang 1 khi đổi filter)
  const paginatedQueryKey = [...queryKey, { page: effectivePage, pageSize }];

  // Main query for current page
  const {
    data: queryData,
    isLoading,
    isFetching,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: paginatedQueryKey,
    queryFn: async () => {
      const page = effectivePage;
      const result = await fetchFunction(page, pageSize);
      // Gắn thêm `page` để tránh trường hợp append nhầm dữ liệu page cũ
      // trong lúc `currentPage` đã đổi nhưng query chưa trả về.
      return { ...result, page } as PaginationQueryData<T>;
    },
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
        // Load more - only append when data corresponds to the expected page
        // (tránh append lại page cũ khi query vừa đổi key và còn giữ previous data).
        if (pendingPageRef.current === queryData.page) {
          setAccumulatedData((prev) => [...prev, ...queryData.data]);
          setIsLoadingMore(false);
          pendingPageRef.current = null;
        }
      } else if (queryData.page === 1) {
        // Page 1 refetch (e.g., from cache invalidation)
        setAccumulatedData(queryData.data);
      }
    }
  }, [queryData, isRefreshing, isLoadingMore]);

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
    setIsLoadingMore(false);
    pendingPageRef.current = null;
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
      const nextPage = currentPage + 1;
      pendingPageRef.current = nextPage;
      setIsLoadingMore(true);
      setCurrentPage(nextPage);
    }
  }, [isFetching, isLoadingMore, currentPage, totalPages]);

  // Determine loading states
  // accumulatedData.length === 0 giữ loading=true trong frame giữa khi isLoading
  // vừa thành false nhưng useEffect chưa chạy để set data → tránh flash EmptyState
  const loading = (isLoading || accumulatedData.length === 0) && isInitialLoad.current;
  const refreshing = isRefreshing && isFetching;
  const loadingMore = isLoadingMore;

  // Error message
  const errorMessage = queryError
    ? (queryError as Error).message || "Không thể tải dữ liệu"
    : null;

  return {
    data: isKeyChanged ? effectiveData : accumulatedData,
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
