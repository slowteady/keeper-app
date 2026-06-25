import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { globalToast } from '@/shared/lib';

import { useLikePost } from './use-like-post';

jest.mock('@/entities/community', () => {
  const actual = jest.requireActual('@/entities/community');
  return {
    ...actual,
    communityApi: {
      ...actual.communityApi,
      likePost: jest.fn(),
      unlikePost: jest.fn()
    }
  };
});

jest.mock('@/features/auth', () => ({
  useLoginRequired: () => ({
    requireLogin: (fn: () => void) => fn()
  })
}));

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: jest.fn() };
});

const mockedLikePost = communityApi.likePost as jest.Mock;
const mockedUnlikePost = communityApi.unlikePost as jest.Mock;
const mockedToast = globalToast as jest.Mock;

const makeListPage = (overrides?: Partial<{ items: unknown[] }>) => ({
  items: [
    { id: '1', isLiked: false, counts: { like: 5, view: 0, comment: 0 } },
    { id: '2', isLiked: true, counts: { like: 10, view: 0, comment: 0 } }
  ],
  total: 2,
  page: 1,
  size: 20,
  hasNext: false,
  ...overrides
});

const setup = () => {
  const queryClient = new QueryClient({
    // gcTime 0 으로 두면 observer 없는 query 가 즉시 GC 되어 setQueriesData patch 가 사라진다.
    // 테스트 setup 에서 setQueryData 로 박은 list/detail 캐시 유지 위해 충분히 큰 값.
    defaultOptions: { queries: { retry: false, gcTime: Infinity }, mutations: { retry: false } }
  });
  // list 캐시 미리 채우기 (InfiniteData 형태)
  queryClient.setQueryData([...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }], {
    pages: [makeListPage()],
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

describe('useLikePost', () => {
  it('반환 객체 shape: toggleLikePost / isPending', () => {
    const { wrapper } = setup();
    const { result } = renderHook(() => useLikePost(), { wrapper });

    expect(typeof result.current.toggleLikePost).toBe('function');
    expect(result.current.isPending).toBe(false);
  });

  it('like 토글 시 onMutate 에서 list 캐시가 낙관적으로 patch 된다', async () => {
    const { queryClient, wrapper } = setup();
    // mock 응답을 지연시켜 onSuccess patch 가 끼어들지 않게 한다 — 낙관 patch 단독 검증
    mockedLikePost.mockImplementation(() => new Promise((r) => setTimeout(() => r({ isLiked: true, count: 6 }), 500)));

    const { result } = renderHook(() => useLikePost(), { wrapper });

    act(() => result.current.toggleLikePost('1', false));

    // onMutate 는 async — setQueriesData 적용까지 마이크로태스크 yield 필요
    await waitFor(() => {
      const cached = queryClient.getQueryData<{
        pages: { items: { id: string; isLiked: boolean; counts: { like: number } }[] }[];
      }>([...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }]);
      // 낙관: like 5 → 6, isLiked false → true
      expect(cached?.pages[0].items[0].isLiked).toBe(true);
      expect(cached?.pages[0].items[0].counts.like).toBe(6);
    });

    expect(mockedLikePost).toHaveBeenCalledWith('1');
  });

  it('unlike 토글 시 count 가 1 감소한다 (음수 가드)', async () => {
    const { queryClient, wrapper } = setup();
    mockedUnlikePost.mockResolvedValue({ isLiked: false, count: 9 });

    const { result } = renderHook(() => useLikePost(), { wrapper });
    act(() => result.current.toggleLikePost('2', true));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{
        pages: { items: { id: string; isLiked: boolean; counts: { like: number } }[] }[];
      }>([...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }]);
      expect(cached?.pages[0].items[1].isLiked).toBe(false);
      expect(cached?.pages[0].items[1].counts.like).toBe(9);
    });

    expect(mockedUnlikePost).toHaveBeenCalledWith('2');
  });

  it('서버 onSuccess 응답으로 count 가 재정합된다 (서버 권위)', async () => {
    const { queryClient, wrapper } = setup();
    // 서버는 다른 사용자 토글도 반영해서 count 가 7 (낙관은 6) 으로 응답
    mockedLikePost.mockResolvedValue({ isLiked: true, count: 7 });

    const { result } = renderHook(() => useLikePost(), { wrapper });
    act(() => result.current.toggleLikePost('1', false));

    await waitFor(() => {
      const cached = queryClient.getQueryData<{
        pages: { items: { id: number; counts: { like: number } }[] }[];
      }>([...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }]);
      expect(cached?.pages[0].items[0].counts.like).toBe(7);
    });
  });

  it('mutation 실패 시 백업으로 롤백 + 에러 토스트', async () => {
    const { queryClient, wrapper } = setup();
    mockedLikePost.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useLikePost(), { wrapper });
    act(() => result.current.toggleLikePost('1', false));

    await waitFor(() => expect(mockedToast).toHaveBeenCalled());

    const cached = queryClient.getQueryData<{
      pages: { items: { id: string; isLiked: boolean; counts: { like: number } }[] }[];
    }>([...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }]);
    // 원래 상태(isLiked: false, like: 5) 로 복원
    expect(cached?.pages[0].items[0]).toEqual({
      id: '1',
      isLiked: false,
      counts: { like: 5, view: 0, comment: 0 }
    });
  });

  it('개인입양 detail 캐시(union ADOPT)도 함께 patch 된다 (prefix 매칭)', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData([...communityQueries.all(), 'detail', '1'], {
      kind: 'ADOPT',
      adopt: { id: '1', isLiked: false, counts: { like: 5, view: 0, comment: 0 } }
    });
    mockedLikePost.mockResolvedValue({ isLiked: true, count: 6 });

    const { result } = renderHook(() => useLikePost(), { wrapper });
    act(() => result.current.toggleLikePost('1', false));

    await waitFor(() => {
      const detail = queryClient.getQueryData<{ adopt: { isLiked: boolean; counts: { like: number } } }>([
        ...communityQueries.all(),
        'detail',
        '1'
      ]);
      expect(detail?.adopt.isLiked).toBe(true);
      expect(detail?.adopt.counts.like).toBe(6);
    });
  });

  it('QnA detail 캐시(union QNA)도 함께 patch 된다', async () => {
    const { queryClient, wrapper } = setup();
    queryClient.setQueryData([...communityQueries.all(), 'detail', '1'], {
      kind: 'QNA',
      qna: { id: '1', isLiked: false, counts: { like: 5, view: 0, comment: 0 } }
    });
    mockedLikePost.mockResolvedValue({ isLiked: true, count: 6 });

    const { result } = renderHook(() => useLikePost(), { wrapper });
    act(() => result.current.toggleLikePost('1', false));

    await waitFor(() => {
      const detail = queryClient.getQueryData<{ qna: { isLiked: boolean; counts: { like: number } } }>([
        ...communityQueries.all(),
        'detail',
        '1'
      ]);
      expect(detail?.qna.isLiked).toBe(true);
      expect(detail?.qna.counts.like).toBe(6);
    });
  });
});
