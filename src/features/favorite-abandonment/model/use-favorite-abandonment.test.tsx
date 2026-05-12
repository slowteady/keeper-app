import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { adoptApi, adoptQueries } from '@/entities/adopt';
import { globalToast } from '@/shared/lib';

import { useFavoriteAbandonment } from './use-favorite-abandonment';

jest.mock('@/entities/adopt', () => {
  const actual = jest.requireActual('@/entities/adopt');
  return {
    ...actual,
    adoptApi: {
      favorite: jest.fn(),
      unfavorite: jest.fn()
    }
  };
});

jest.mock('@/features/auth', () => ({
  useLoginRequired: () => ({ requireLogin: (fn: () => void) => fn() })
}));

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: jest.fn() };
});

const mockedFavorite = adoptApi.favorite as jest.Mock;
const mockedUnfavorite = adoptApi.unfavorite as jest.Mock;
const mockedToast = globalToast as jest.Mock;

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } }
  });
  // adopt list 캐시 — InfiniteData/value 형태
  queryClient.setQueryData([...adoptQueries.all(), 'list', { filter: 'NEW' }], {
    pages: [
      {
        value: [
          { id: 'D1', isFavorited: false },
          { id: 'D2', isFavorited: true }
        ]
      }
    ],
    pageParams: [1]
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { queryClient, wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useFavoriteAbandonment', () => {
  it('shape: toggleFavoriteAbandonment / isPending', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useFavoriteAbandonment(), { wrapper });
    expect(typeof result.current.toggleFavoriteAbandonment).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('favorite 토글 시 list 캐시(value) 낙관적 patch true', async () => {
    const { queryClient, wrapper } = setup();
    mockedFavorite.mockImplementation(() => new Promise((r) => setTimeout(() => r({ isFavorited: true }), 500)));

    const { result } = renderHook(() => useFavoriteAbandonment(), { wrapper });
    act(() => result.current.toggleFavoriteAbandonment('D1', false));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{ pages: { value: { id: string; isFavorited: boolean }[] }[] }>([
        ...adoptQueries.all(),
        'list',
        { filter: 'NEW' }
      ]);
      expect(cached?.pages[0].value[0].isFavorited).toBe(true);
    });
    expect(mockedFavorite).toHaveBeenCalledWith('D1');
  });

  it('unfavorite 토글 시 false 로 patch', async () => {
    const { queryClient, wrapper } = setup();
    mockedUnfavorite.mockResolvedValue({ isFavorited: false });

    const { result } = renderHook(() => useFavoriteAbandonment(), { wrapper });
    act(() => result.current.toggleFavoriteAbandonment('D2', true));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{ pages: { value: { id: string; isFavorited: boolean }[] }[] }>([
        ...adoptQueries.all(),
        'list',
        { filter: 'NEW' }
      ]);
      expect(cached?.pages[0].value[1].isFavorited).toBe(false);
    });
  });

  it('실패 시 백업으로 롤백 + 토스트', async () => {
    const { queryClient, wrapper } = setup();
    mockedFavorite.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useFavoriteAbandonment(), { wrapper });
    act(() => result.current.toggleFavoriteAbandonment('D1', false));

    await waitFor(() => expect(mockedToast).toHaveBeenCalled());

    const cached = queryClient.getQueryData<{ pages: { value: { id: string; isFavorited: boolean }[] }[] }>([
      ...adoptQueries.all(),
      'list',
      { filter: 'NEW' }
    ]);
    expect(cached?.pages[0].value[0].isFavorited).toBe(false);
  });

  it('detail 캐시도 함께 patch (prefix 매칭)', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData([...adoptQueries.all(), 'detail', 'D1'], { id: 'D1', isFavorited: false });
    mockedFavorite.mockResolvedValue({ isFavorited: true });

    const { result } = renderHook(() => useFavoriteAbandonment(), { wrapper });
    act(() => result.current.toggleFavoriteAbandonment('D1', false));

    await waitFor(() => {
      const detail = queryClient.getQueryData<{ id: string; isFavorited: boolean }>([
        ...adoptQueries.all(),
        'detail',
        'D1'
      ]);
      expect(detail?.isFavorited).toBe(true);
    });
  });
});
