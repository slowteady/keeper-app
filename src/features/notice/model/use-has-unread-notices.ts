import { useQuery } from '@tanstack/react-query';

import { noticeQueries } from '@/entities/notice';

import { isNoticeFresh } from '../lib/notice-freshness';
import { useReadNotices } from './use-read-notices';

export const useHasUnreadNotices = () => {
  const { data } = useQuery({ ...noticeQueries.list(), throwOnError: false });
  const { readIds } = useReadNotices();

  const unreadIds = (data?.items ?? [])
    .filter((notice) => isNoticeFresh(notice.createdAt) && !readIds.includes(notice.id))
    .map((notice) => notice.id);

  return { hasUnread: unreadIds.length > 0, unreadIds };
};
