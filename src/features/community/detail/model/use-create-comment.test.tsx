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

  it('성공 시 해당 postId 댓글 리스트 invalidate (성공 토스트는 띄우지 않음 — Instagram BP)', async () => {
    mockedCreate.mockResolvedValue({ id: 1 });
    const { queryClient, wrapper } = setup();
    const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateComment({ postId: '10' }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ content: '내용' });
    });

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: [...commentQueries.all(), 'list', '10'] });
    });
    expect(mockedToast).not.toHaveBeenCalled();
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
      expect(mockedToast).toHaveBeenCalledWith(expect.stringMatching(/실패/), 'fail');
    });
  });
});
