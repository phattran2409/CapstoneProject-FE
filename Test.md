# Testing Guide (Hook-focused, gọn mà đủ)

## 1) Mục tiêu test trong project này
- Kiểm tra hook hoạt động ổn định ở các flow chính.
- Tránh over-test; ưu tiên các case có giá trị:
  - `success`
  - `error`
  - `config/fetch/mapping` (với wrapper hook như `usePaginatedFriends`)

---

## 2) Template test hook tối giản

### A. Query hook (`useQuery`) - 2 case (success + error)
```ts
/// <reference types="jest" />
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useMyHook } from '../useMyHook';
import * as api from '../../api/myApi';

jest.mock('../../api/myApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 1 } },
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useMyHook', () => {
  beforeEach(() => jest.clearAllMocks());

  it('should return data on success', async () => {
    (api.getData as jest.Mock).mockResolvedValue({ items: [1, 2, 3] });
    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ items: [1, 2, 3] });
  });

  it('should return error on failure', async () => {
    (api.getData as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useMyHook(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeTruthy();
  });
});
```

### B. Wrapper pagination hook - 3 case (config + fetch + mapping)
```ts
/// <reference types="jest" />
import { renderHook } from '@testing-library/react-native';
import { usePagination } from '@/shared/hooks/usePagination';
import { usePaginatedFriends } from '../usePaginatedFriends';
import { getFriends } from '../../api';

jest.mock('@/shared/hooks/usePagination');
jest.mock('../../api', () => ({ ...jest.requireActual('../../api'), getFriends: jest.fn() }));

const base = {
  data: [],
  loading: false,
  refreshing: false,
  loadingMore: false,
  error: null,
  hasMore: false,
  refresh: jest.fn(),
  loadMore: jest.fn(),
  setData: jest.fn(),
};

describe('usePaginatedFriends', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePagination as jest.Mock).mockReturnValue(base);
  });

  it('should call usePagination with default config', () => {
    renderHook(() => usePaginatedFriends());
    expect(usePagination).toHaveBeenCalled();
  });

  it('should call fetchFunction -> API', async () => {
    renderHook(() => usePaginatedFriends({ searchTerm: 'Alice' }));
    const { fetchFunction } = (usePagination as jest.Mock).mock.calls[0][0];

    (getFriends as jest.Mock).mockResolvedValue({ friends: [], totalPages: 1, totalCount: 0 });
    await fetchFunction(1, 10);
    expect(getFriends).toHaveBeenCalledWith(1, 10, 'Alice');
  });

  it('should map pagination data to output', () => {
    (usePagination as jest.Mock).mockReturnValue({ ...base, data: [{ userId: 'u1' }] });
    const { result } = renderHook(() => usePaginatedFriends());
    expect(result.current.friends).toEqual([{ userId: 'u1' }]);
  });
});
```

---

## 3) Các khái niệm quan trọng
- `renderHook`: render hook để đọc state/flags (`isLoading`, `isSuccess`, `isError`).
- `waitFor`: chờ state async đổi trước khi assert.
- `QueryClientProvider`: bắt buộc cho hook dùng React Query.
- `jest.mock(...)`: cô lập API/dependency để test không gọi network thật.
- `retry: false`: giúp test deterministic, không timeout vì retry.
- `describe()`: Khối nhóm các test case liên quan đến nhau; giúp cấu trúc, phân nhóm suite test.
- `it()`/`test()`: Định nghĩa một test case cụ thể ("should do something ...").
- `beforeEach()`: Hàm callback chạy trước mỗi test trong `describe` (dùng để reset state/mock, chuẩn bị dữ liệu).
- `afterEach()`: Hàm callback chạy sau mỗi test (thường để dọn dẹp, clear mocks, v.v).
- `createWrapper`: Hàm khởi tạo wrapper component cung cấp context (thường dùng cho hooks dùng React Query, Redux, ...).

---

## 4) Cài đặt `jest.setup.ts` trong project này
File `jest.setup.ts` hiện dùng để:
- Mock AsyncStorage cho môi trường Jest.
- Tắt log `console.log/warn/error` để output test sạch hơn.

Đảm bảo `package.json` có:
```json
"jest": {
  "setupFilesAfterEnv": [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/jest.setup.ts"
  ]
}
```

---

## 5) Cách chạy test
- Chạy toàn bộ:
```bash
npm test
```

- Chạy 1 file:
```bash
npm test -- src/features/leaderboard/hooks/__tests__/useLeaderboard.test.ts
```

- Chạy nhiều file:
```bash
npm test -- src/features/friends/hooks/__tests__/useGetFriendshipStatus.test.ts src/features/friends/hooks/__tests__/useMutationFriends.test.ts
```

- Chạy theo tên suite/case:
```bash
npm test -- -t "useLeaderboard"
```

---
