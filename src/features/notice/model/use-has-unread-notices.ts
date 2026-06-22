import { useQuery } from '@tanstack/react-query';

import { noticeQueries } from '@/entities/notice';

import { useReadNotices } from './use-read-notices';

const FRESH_MS = 30 * 24 * 60 * 60 * 1000;

export const isNoticeFresh = (createdAt: string) => Date.now() - new Date(createdAt).getTime() <= FRESH_MS;

export const getLatestNotice = <T extends { createdAt: string }>(items: T[]): T =>
  items.reduce((newest, item) => (item.createdAt > newest.createdAt ? item : newest));

export const useHasUnreadNotices = () => {
  const { data } = useQuery({ ...noticeQueries.list(), throwOnError: false });
  const { readIds } = useReadNotices();

  const unreadIds = (data?.items ?? [])
    .filter((notice) => isNoticeFresh(notice.createdAt) && !readIds.includes(notice.id))
    .map((notice) => notice.id);

  return { hasUnread: unreadIds.length > 0, unreadIds };
};
