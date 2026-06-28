import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { commentQueries } from '@/entities/comment';
import { communityQueries } from '@/entities/community';
import { authApi } from '@/shared/api/instance';

import { useBlock } from './use-block';

jest.mock('@/shared/lib', () => {
  const actual = jest.requireActual('@/shared/lib');
  return { ...actual, globalToast: jest.fn() };
});

const setup = () => {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false, gcTime: Infinity } }
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { queryClient, wrapper };
};

const makePage = () => ({
  pages: [
    {
      items: [
        { id: 'p1', user: { id: 'blocked' } },
        { id: 'p2', user: { id: 'other' } }
      ]
    }
  ],
  pageParams: [null]
});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(authApi, 'post').mockResolvedValue({ data: {} } as never);
});

describe('useBlock', () => {
  it('차단 시 일반·QnA 리스트 양쪽에서 차단 유저 항목을 제거', async () => {
    const { queryClient, wrapper } = setup();
    const listKey = [...communityQueries.all(), 'list', { category: 'ADOPTION_PERSONAL' }];
    const qnaListKey = [...communityQueries.all(), 'qna', 'list', { category: 'QNA' }];
    queryClient.setQueryData(listKey, makePage());
    queryClient.setQueryData(qnaListKey, makePage());

    const { result } = renderHook(() => useBlock(), { wrapper });
    await act(async () => {
      await result.current.block('blocked');
    });

    await waitFor(() => {
      const list = queryClient.getQueryData(listKey) as { pages: { items: { id: string }[] }[] };
      const qna = queryClient.getQueryData(qnaListKey) as { pages: { items: { id: string }[] }[] };
      expect(list.pages[0].items.map((i) => i.id)).toEqual(['p2']);
      expect(qna.pages[0].items.map((i) => i.id)).toEqual(['p2']);
    });
  });

  it('차단 시 댓글·답글 리스트에서도 차단 유저 항목을 제거', async () => {
    const { queryClient, wrapper } = setup();
    const commentListKey = [...commentQueries.all(), 'list', 'post1', { sort: 'LATEST', size: 20 }];
    const repliesKey = [...commentQueries.all(), 'replies', 'p1', { size: 20 }];
    queryClient.setQueryData(commentListKey, makePage());
    queryClient.setQueryData(repliesKey, makePage());

    const { result } = renderHook(() => useBlock(), { wrapper });
    await act(async () => {
      await result.current.block('blocked');
    });

    await waitFor(() => {
      const list = queryClient.getQueryData(commentListKey) as { pages: { items: { id: string }[] }[] };
      const replies = queryClient.getQueryData(repliesKey) as { pages: { items: { id: string }[] }[] };
      expect(list.pages[0].items.map((i) => i.id)).toEqual(['p2']);
      expect(replies.pages[0].items.map((i) => i.id)).toEqual(['p2']);
    });
  });
});
