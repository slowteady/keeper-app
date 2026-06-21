import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { shelterApi, shelterQueries } from '@/entities/shelter';
import { globalToast } from '@/shared/lib';

import { useFavoriteShelter } from './use-favorite-shelter';

jest.mock('@/entities/shelter', () => {
  const actual = jest.requireActual('@/entities/shelter');
  return {
    ...actual,
    shelterApi: {
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

const mockedFavorite = shelterApi.favorite as jest.Mock;
const mockedUnfavorite = shelterApi.unfavorite as jest.Mock;
const mockedToast = globalToast as jest.Mock;

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } }
  });
  // list 캐시 미리 채우기 (InfiniteData/items 형태 모사)
  queryClient.setQueryData([...shelterQueries.all(), 'list', { lat: 37.5, lng: 127.0 }], {
    pages: [
      {
        items: [
          { id: 'S1', isFavorited: false },
          { id: 'S2', isFavorited: true }
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

describe('useFavoriteShelter', () => {
  it('shape: toggleFavoriteShelter / isPending', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    expect(typeof result.current.toggleFavoriteShelter).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('favorite 토글 시 list 캐시 낙관적 patch (isFavorited true)', async () => {
    const { queryClient, wrapper } = setup();
    mockedFavorite.mockImplementation(() => new Promise((r) => setTimeout(() => r({ isFavorited: true }), 500)));

    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    act(() => result.current.toggleFavoriteShelter('S1', false));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{ pages: { items: { id: string; isFavorited: boolean }[] }[] }>([
        ...shelterQueries.all(),
        'list',
        { lat: 37.5, lng: 127.0 }
      ]);
      expect(cached?.pages[0].items[0].isFavorited).toBe(true);
    });

    expect(mockedFavorite).toHaveBeenCalledWith('S1');
  });

  it('unfavorite 토글 시 isFavorited false 로 patch', async () => {
    const { queryClient, wrapper } = setup();
    mockedUnfavorite.mockResolvedValue({ isFavorited: false });

    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    act(() => result.current.toggleFavoriteShelter('S2', true));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{ pages: { items: { id: string; isFavorited: boolean }[] }[] }>([
        ...shelterQueries.all(),
        'list',
        { lat: 37.5, lng: 127.0 }
      ]);
      expect(cached?.pages[0].items[1].isFavorited).toBe(false);
    });
    expect(mockedUnfavorite).toHaveBeenCalledWith('S2');
  });

  it('실패 시 백업으로 롤백 + 에러 토스트', async () => {
    const { queryClient, wrapper } = setup();
    mockedFavorite.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    act(() => result.current.toggleFavoriteShelter('S1', false));

    await waitFor(() => expect(mockedToast).toHaveBeenCalled());

    const cached = queryClient.getQueryData<{ pages: { items: { id: string; isFavorited: boolean }[] }[] }>([
      ...shelterQueries.all(),
      'list',
      { lat: 37.5, lng: 127.0 }
    ]);
    expect(cached?.pages[0].items[0].isFavorited).toBe(false);
  });

  it('settled 시 me-favorite-shelters(관심 목록) 도 무효화 → 즉시 반영', async () => {
    const { queryClient, wrapper } = setup();
    mockedFavorite.mockResolvedValue({ isFavorited: true });
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    act(() => result.current.toggleFavoriteShelter('S1', false));

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    const hit = invalidateSpy.mock.calls.some(
      ([f]) =>
        JSON.stringify((f as { queryKey?: unknown } | undefined)?.queryKey) === JSON.stringify(['me-favorite-shelters'])
    );
    expect(hit).toBe(true);
  });

  it('detail 캐시도 함께 patch (prefix 매칭)', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData([...shelterQueries.all(), 'detail', 'S1'], {
      id: 'S1',
      name: '보호소1',
      isFavorited: false
    });
    mockedFavorite.mockResolvedValue({ isFavorited: true });

    const { result } = renderHook(() => useFavoriteShelter(), { wrapper });
    act(() => result.current.toggleFavoriteShelter('S1', false));

    await waitFor(() => {
      const detail = queryClient.getQueryData<{ id: string; isFavorited: boolean }>([
        ...shelterQueries.all(),
        'detail',
        'S1'
      ]);
      expect(detail?.isFavorited).toBe(true);
    });
  });
});
