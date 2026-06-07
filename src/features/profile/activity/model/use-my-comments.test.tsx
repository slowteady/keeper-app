import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { useMyComments } from './use-my-comments';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn()
}));

const mockAuthApiGet = jest.fn();
jest.mock('@/shared/api/instance', () => ({
  authApi: {
    get: (...args: unknown[]) => mockAuthApiGet(...args)
  }
}));

const wrapper = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useMyComments', () => {
  beforeEach(() => {
    mockAuthApiGet.mockResolvedValue({
      data: {
        data: {
          items: [],
          total: 0,
          page: 1,
          size: 20,
          hasNext: false
        }
      }
    });
  });

  it('GET /community/me/comments 를 page/size 와 함께 호출한다', async () => {
    const { result } = renderHook(() => useMyComments(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockAuthApiGet).toHaveBeenCalledWith('/community/me/comments', {
      params: { page: 1, size: 20 }
    });
  });
});
