import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { type ReactNode } from 'react';

import { NoticeListItemDto, noticeQueries } from '@/entities/notice';

import { getLatestNotice, isNoticeFresh, useHasUnreadNotices } from './use-has-unread-notices';
import { NOTICE_READ_QUERY_KEY } from './use-read-notices';

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

const item = (over: Partial<NoticeListItemDto> = {}): NoticeListItemDto => ({
  id: 'n1',
  type: 'NORMAL',
  title: '공지',
  isPinned: false,
  createdAt: daysAgo(1),
  ...over
});

describe('isNoticeFresh', () => {
  it('30일 이내면 fresh', () => {
    expect(isNoticeFresh(daysAgo(29))).toBe(true);
  });

  it('30일 초과면 not fresh', () => {
    expect(isNoticeFresh(daysAgo(31))).toBe(false);
  });
});

describe('getLatestNotice', () => {
  it('배열 순서·핀과 무관하게 createdAt 최신을 고른다', () => {
    const items = [
      item({ id: 'pinned-old', isPinned: true, createdAt: daysAgo(10) }),
      item({ id: 'newest', createdAt: daysAgo(1) }),
      item({ id: 'mid', createdAt: daysAgo(5) })
    ];
    expect(getLatestNotice(items).id).toBe('newest');
  });
});

describe('useHasUnreadNotices', () => {
  const setup = (items: NoticeListItemDto[], readIds: string[]) => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity, gcTime: Infinity } }
    });
    queryClient.setQueryData(noticeQueries.list().queryKey, {
      items,
      total: items.length,
      page: 1,
      size: 50,
      hasNext: false
    });
    queryClient.setQueryData(NOTICE_READ_QUERY_KEY, readIds);
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return renderHook(() => useHasUnreadNotices(), { wrapper });
  };

  it('안 읽고 30일 이내면 unread', () => {
    const { result } = setup([item({ id: 'a', createdAt: daysAgo(2) })], []);
    expect(result.current.hasUnread).toBe(true);
    expect(result.current.unreadIds).toEqual(['a']);
  });

  it('읽은 공지는 제외', () => {
    const { result } = setup([item({ id: 'a', createdAt: daysAgo(2) })], ['a']);
    expect(result.current.hasUnread).toBe(false);
  });

  it('30일 초과는 안 읽어도 제외', () => {
    const { result } = setup([item({ id: 'a', createdAt: daysAgo(40) })], []);
    expect(result.current.hasUnread).toBe(false);
  });

  it('안 읽은 fresh가 하나라도 있으면 hasUnread', () => {
    const { result } = setup(
      [
        item({ id: 'read', createdAt: daysAgo(2) }),
        item({ id: 'old', createdAt: daysAgo(40) }),
        item({ id: 'fresh', createdAt: daysAgo(3) })
      ],
      ['read']
    );
    expect(result.current.hasUnread).toBe(true);
    expect(result.current.unreadIds).toEqual(['fresh']);
  });
});
