import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { useMyHelpfulComments } from './use-my-helpful-comments';

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn()
}));

const mockAuthApiGet = jest.fn();
jest.mock('@/shared/api/instance', () => ({
  authApi: {
    get: (...args: unknown[]) => mockAuthApiGet(...args)
  }
}));

const makePage = (overrides?: Partial<{ items: unknown[]; total: number; page: number; hasNext: boolean }>) => ({
  data: {
    data: {
      items: [
        {
          id: 1,
          content: '도움된 댓글',
          displayTime: '2026-05-26T00:00:00.000Z',
          helpfulCount: 30,
          isHelpful: true,
          postId: 10,
          postCategory: 'ADOPTION_PERSONAL',
          postTitle: '골든 리트리버 입양',
          postThumbnail: 'https://img/1.jpg'
        }
      ],
      total: 1,
      page: 1,
      size: 20,
      hasNext: false,
      ...overrides
    }
  }
});

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { wrapper };
};

describe('useMyHelpfulComments', () => {
  beforeEach(() => {
    mockAuthApiGet.mockReset();
  });

  it('hook shape: items / total / hasNext / fetchNextPage / refetch / isLoading', () => {
    mockAuthApiGet.mockResolvedValue(makePage());
    const { wrapper } = setup();
    const { result } = renderHook(() => useMyHelpfulComments(), { wrapper });

    expect(result.current).toHaveProperty('items');
    expect(result.current).toHaveProperty('total');
    expect(result.current).toHaveProperty('hasNext');
    expect(result.current).toHaveProperty('isLoading');
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('첫 페이지 응답을 items / total / hasNext 에 매핑한다', async () => {
    mockAuthApiGet.mockResolvedValue(makePage());
    const { wrapper } = setup();
    const { result } = renderHook(() => useMyHelpfulComments(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject({
      id: 1,
      postTitle: '골든 리트리버 입양',
      helpfulCount: 30
    });
    expect(result.current.total).toBe(1);
    expect(result.current.hasNext).toBe(false);
  });

  it('GET /me/helpful-comments 를 page/size 와 함께 호출한다', async () => {
    mockAuthApiGet.mockResolvedValue(makePage());
    const { wrapper } = setup();
    renderHook(() => useMyHelpfulComments(), { wrapper });

    await waitFor(() => {
      expect(mockAuthApiGet).toHaveBeenCalledWith('/me/helpful-comments', {
        params: { page: 1, size: 20 }
      });
    });
  });
});
