import { useState, useCallback, useEffect } from "react";

interface UsePaginationOptions<T> {
  fetchFunction: (
    page: number,
    pageSize: number,
  ) => Promise<{
    data: T[];
    totalPages: number;
    totalCount: number;
  }>;
  pageSize?: number;
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
  fetchFunction,
  pageSize = 10,
  onError,
}: UsePaginationOptions<T>): UsePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = useCallback(
    async (
      pageNum: number = 1,
      isRefresh: boolean = false,
      isLoadMore: boolean = false,
    ) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setLoading(true);
        }
        setError(null);

        const result = await fetchFunction(pageNum, pageSize);

        if (isRefresh) {
          setData(result.data);
        } else if (isLoadMore) {
          setData((prevData) => [...prevData, ...result.data]);
        } else {
          setData(result.data);
        }

        setTotalPages(result.totalPages);
        setPage(pageNum);
      } catch (err: any) {
        const errorMessage = err.message || "Không thể tải dữ liệu";
        setError(errorMessage);
        onError?.(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [fetchFunction, pageSize, onError],
  );

  const refresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  const loadMore = useCallback(() => {
    if (!loadingMore && page < totalPages) {
      fetchData(page + 1, false, true);
    }
  }, [loadingMore, page, totalPages, fetchData]);

  // Initial load
  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    refreshing,
    loadingMore,
    error,
    page,
    totalPages,
    hasMore: page < totalPages,
    refresh,
    loadMore,
    setData,
  };
}
