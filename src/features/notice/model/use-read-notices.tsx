import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { addReadNoticeId, getReadNoticeIds } from '../lib/notice-storage';

export const NOTICE_READ_QUERY_KEY = ['notices', 'read'] as const;

export const useReadNotices = () => {
  const queryClient = useQueryClient();
  const { data: readIds = [] } = useQuery({
    queryKey: NOTICE_READ_QUERY_KEY,
    queryFn: getReadNoticeIds,
    staleTime: Infinity,
    throwOnError: false
  });

  const markRead = useCallback(
    async (id: string) => {
      const next = await addReadNoticeId(id);
      queryClient.setQueryData(NOTICE_READ_QUERY_KEY, next);
    },
    [queryClient]
  );

  return { readIds, markRead };
};
