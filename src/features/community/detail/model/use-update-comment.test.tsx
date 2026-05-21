import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { commentApi, commentQueries } from '@/entities/comment';
import { globalToast } from '@/shared/lib';

import { useUpdateComment } from './use-update-comment';

jest.mock('@/entities/comment', () => {
  const actual = jest.requireActual('@/entities/comment');
  return {
    ...actual,
    commentApi: { ...actual.commentApi, update: jest.fn() }
  };
});

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: jest.fn() };
});

const mockedUpdate = commentApi.update as jest.Mock;
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

describe('useUpdateComment', () => {
  it('mutate 시 commentApi.update(id, content) 호출', async () => {
    mockedUpdate.mockResolvedValue({ id: 1 });
    const { wrapper } = setup();
    const { result } = renderHook(() => useUpdateComment({ postId: 10 }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ commentId: 5, content: '수정' });
    });

    expect(mockedUpdate).toHaveBeenCalledWith(5, '수정');
  });

  it('성공 시 list / replies 캐시의 해당 댓글 즉시 갱신 — refetch 의존 X (성공 토스트 X)', async () => {
    const updated = { id: 5, content: '수정후' };
    mockedUpdate.mockResolvedValue(updated);
    const { queryClient, wrapper } = setup();
    const setSpy = jest.spyOn(queryClient, 'setQueriesData');

    const { result } = renderHook(() => useUpdateComment({ postId: 10 }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ commentId: 5, content: '수정후' });
    });

    await waitFor(() => {
      expect(setSpy).toHaveBeenCalledWith({ queryKey: [...commentQueries.all(), 'list', 10] }, expect.any(Function));
      expect(setSpy).toHaveBeenCalledWith({ queryKey: [...commentQueries.all(), 'replies'] }, expect.any(Function));
    });
    expect(mockedToast).not.toHaveBeenCalled();
  });

  it('실패 시 실패 토스트', async () => {
    mockedUpdate.mockRejectedValue(new Error('network'));
    const { wrapper } = setup();
    const { result } = renderHook(() => useUpdateComment({ postId: 10 }), { wrapper });

    await act(async () => {
      try {
        await result.current.mutateAsync({ commentId: 5, content: '내용' });
      } catch {
        // 실패 토스트 검증이 목적
      }
    });

    await waitFor(() => {
      expect(mockedToast).toHaveBeenCalledWith(expect.stringMatching(/실패/), 'fail');
    });
  });
});
