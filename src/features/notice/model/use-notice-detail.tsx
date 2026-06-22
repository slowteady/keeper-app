import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { noticeQueries } from '@/entities/notice';

import { useReadNotices } from './use-read-notices';

export const useNoticeDetail = (id: string) => {
  const query = useSuspenseQuery(noticeQueries.detail(id));
  const { markRead } = useReadNotices();

  useEffect(() => {
    markRead(id);
  }, [id, markRead]);

  return query;
};
