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

  it('성공 시 해당 postId 댓글 리스트 invalidate + 성공 토스트', async () => {
    mockedUpdate.mockResolvedValue({ id: 1 });
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useUpdateComment({ postId: 10 }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ commentId: 5, content: '내용' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [...commentQueries.all(), 'list', 10] });
      expect(mockedToast).toHaveBeenCalledWith('댓글을 수정했어요.', 'success');
    });
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
