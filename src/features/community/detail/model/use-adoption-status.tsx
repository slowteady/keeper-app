import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { communityApi, communityQueries } from '@/entities/community';
import { globalToast } from '@/shared/lib';

type AdoptionStatus = 'IN_PROGRESS' | 'COMPLETED';

export const useAdoptionStatus = (postId: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (status: AdoptionStatus) => communityApi.updateAdoptionStatus(postId, status),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [...communityQueries.all(), 'detail', postId] }),
        queryClient.invalidateQueries({ queryKey: communityQueries.all() }),
        queryClient.invalidateQueries({ queryKey: communityQueries.myPostListKey() })
      ]);
    },
    onError: () => globalToast('입양 상태를 변경하지 못했어요', 'fail')
  });

  const setCompleted = useCallback(() => mutation.mutate('COMPLETED'), [mutation]);
  const setInProgress = useCallback(() => mutation.mutate('IN_PROGRESS'), [mutation]);

  return { setCompleted, setInProgress, isPending: mutation.isPending };
};
