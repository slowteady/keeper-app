import { useMutation, useQueryClient } from '@tanstack/react-query';

import { missingApi, missingQueries } from '@/entities/missing';
import { globalToast } from '@/shared/lib';

export const useResolveMissing = (id: string, isResolved = false) => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => missingApi.resolve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: missingQueries.all() });
      globalToast(isResolved ? '실종중으로 변경했어요' : '찾음으로 변경했어요', 'success');
    },
    onError: () => globalToast('처리하지 못했어요', 'fail')
  });

  return { resolve: mutate, isResolving: isPending };
};
