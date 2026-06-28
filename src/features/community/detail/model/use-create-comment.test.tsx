import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

import { useCreateComment } from './use-create-comment';

jest.mock('@/entities/comment', () => {
  const actual = jest.requireActual('@/entities/comment');
  return {
    ...actual,
    commentApi: { ...actual.commentApi, create: jest.fn() }
  };
});

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: jest.fn() };
});

const mockedCreate = commentApi.create as jest.Mock;
const mockedToast = globalToast as jest.Mock;

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useCreateComment', () => {
  it('mutate({content}) 호출 시 commentApi.create(postId, content, undefined) 호출', async () => {
    mockedCreate.mockResolvedValue({ id: 1 });
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '첫 댓글' });
    });

    expect(mockedCreate).toHaveBeenCalledWith('10', '첫 댓글', undefined);
  });

  it('mutate({content, parentId}) 호출 시 commentApi.create 에 parentId 전달', async () => {
    mockedCreate.mockResolvedValue({ id: 1 });
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '답글', parentId: '5' });
    });

    expect(mockedCreate).toHaveBeenCalledWith('10', '답글', '5');
  });

  it('성공 시 해당 postId 댓글 리스트 invalidate(refetchType none — 낙관 prepend 유지) (성공 토스트는 띄우지 않음 — Instagram BP)', async () => {
    mockedCreate.mockResolvedValue({ id: 1 });
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '내용' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [...commentQueries.all(), 'list', '10'],
        refetchType: 'none'
      });
    });
    expect(mockedToast).not.toHaveBeenCalled();
  });

  it('답글 생성 시 부모 댓글 replyCount 를 optimistic +1', async () => {
    let resolveCreate!: (value: unknown) => void;
    mockedCreate.mockReturnValue(new Promise((res) => (resolveCreate = res)));
    const { queryClient, wrapper } = setup();
    const listKey = [...commentQueries.all(), 'list', '10'];
    queryClient.setQueryData(listKey, {
      pages: [{ items: [{ id: 'p1', replyCount: 0, content: '부모' }], nextCursor: null, hasNext: false }],
      pageParams: [null]
    });

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutateAsync({ content: '답글', parentId: 'p1' }).catch(() => undefined);
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(listKey) as { pages: { items: { id: string; replyCount: number }[] }[] };
      expect(data.pages[0].items[0].replyCount).toBe(1);
    });

    await act(async () => {
      resolveCreate({ id: 'r1', content: '답글', parentId: 'p1' });
      await pending;
    });
  });

  it('답글 캐시가 없어도(미펼침) optimistic 답글이 시드된다', async () => {
    let resolveCreate!: (value: unknown) => void;
    mockedCreate.mockReturnValue(new Promise((res) => (resolveCreate = res)));
    const { queryClient, wrapper } = setup();
    const repliesKey = commentQueries.replies('p1').queryKey;

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutateAsync({ content: '답글', parentId: 'p1' }).catch(() => undefined);
    });

    await waitFor(() => {
      const data = queryClient.getQueryData(repliesKey) as { pages: { items: { content: string }[] }[] } | undefined;
      expect(data?.pages[0].items[0].content).toBe('답글');
    });

    await act(async () => {
      resolveCreate({ id: 'r1', content: '답글', parentId: 'p1' });
      await pending;
    });
  });

  it('답글 생성 후 부모 답글 쿼리를 invalidate (서버 정합 — 동시 답글 유실 방지)', async () => {
    mockedCreate.mockResolvedValue({ id: 'r1', content: '답글', parentId: 'p1' });
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '답글', parentId: 'p1' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: commentQueries.replies('p1').queryKey });
    });
  });

  it('작성 시 게시글 comment 카운트를 optimistic +1 (detail union)', async () => {
    let resolveCreate!: (value: unknown) => void;
    mockedCreate.mockReturnValue(new Promise((res) => (resolveCreate = res)));
    const { queryClient, wrapper } = setup();
    const detailKey = ['community', 'detail', '10'];
    queryClient.setQueryData(detailKey, { kind: 'QNA', qna: { id: '10', counts: { comment: 2 } } });

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    let pending!: Promise<unknown>;
    act(() => {
      pending = result.current.mutateAsync({ content: '댓글' }).catch(() => undefined);
    });

    await waitFor(() => {
      const d = queryClient.getQueryData(detailKey) as { qna: { counts: { comment: number } } };
      expect(d.qna.counts.comment).toBe(3);
    });

    await act(async () => {
      resolveCreate({ id: 'c1', content: '댓글', parentId: null });
      await pending;
    });
  });

  it('실패 시 실패 토스트 노출', async () => {
    mockedCreate.mockRejectedValue(new Error('network'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ content: '내용' });
      } catch {
        // 예외 무시 (mutation 실패 토스트 검증이 목적)
      }
    });

    await waitFor(() => {
      expect(mockedToast).toHaveBeenCalledWith('댓글을 등록하지 못했어요', 'fail');
    });
  });
});
