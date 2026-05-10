import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/shared/api/instance';
import { globalToast } from '@/shared/lib';

const blockApi = {
  block: async (userId: number) => {
    await authApi.post(`/api/users/${userId}/block`);
  },
  unblock: async (userId: number) => {
    await authApi.delete(`/api/users/${userId}/block`);
  }
};

export const useBlock = () => {
  const queryClient = useQueryClient();

  const blockMutation = useMutation({
    mutationFn: (userId: number) => blockApi.block(userId)
  });
  const unblockMutation = useMutation({
    mutationFn: (userId: number) => blockApi.unblock(userId)
  });

  const block = async (userId: number) => {
    try {
      await blockMutation.mutateAsync(userId);
      // 차단 후 list/detail 갱신 (차단 유저 컨텐츠 비노출)
      await queryClient.invalidateQueries({ queryKey: ['community'] });
      globalToast('차단했어요.', 'success');
    } catch {
      globalToast('차단에 실패했어요.', 'fail');
    }
  };

  const unblock = async (userId: number) => {
    try {
      await unblockMutation.mutateAsync(userId);
      await queryClient.invalidateQueries({ queryKey: ['community'] });
      await queryClient.invalidateQueries({ queryKey: ['blocks'] });
      globalToast('차단 해제했어요.', 'success');
    } catch {
      globalToast('차단 해제에 실패했어요.', 'fail');
    }
  };

  return {
    block,
    unblock,
    isPending: blockMutation.isPending || unblockMutation.isPending
  };
};
