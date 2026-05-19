import { useCallback } from 'react';

import { useLoginRequired } from '@/features/auth';
import { globalToast } from '@/shared/lib';
import { useBottomSheet } from '@/shared/ui';

import { CommunityPolicyContent } from '../ui/community-policy-content';
import { useAgreeCommunityPolicy, useCommunityPolicyStatus } from './use-community-policy';

export const useRequireCommunityPolicy = () => {
  const { isLoggedIn } = useLoginRequired();
  // 비로그인 시 fetch 시도하면 401 → refresh 실패 → render error. 로그인 됐을 때만 정책 상태 조회.
  const { data: status, refetch } = useCommunityPolicyStatus(isLoggedIn);
  const { mutateAsync, isPending } = useAgreeCommunityPolicy();
  const { present, dismiss } = useBottomSheet();

  const requirePolicy = useCallback(
    async (callback?: () => void | Promise<void>): Promise<boolean> => {
      // 항상 fresh fetch — 다른 디바이스/세션에서 정책 변경 가능, frontend cache 만 보면 stale.
      const fresh = await refetch();
      const currentAgreed = fresh.data?.agreed ?? false;
      if (currentAgreed) {
        await callback?.();
        return true;
      }

      return new Promise<boolean>((resolve) => {
        let confirmed = false;

        const handleConfirm = async () => {
          try {
            await mutateAsync();
            confirmed = true;
            dismiss();
            await callback?.();
            resolve(true);
          } catch {
            globalToast('약관 동의 처리에 실패했어요. 다시 시도해주세요.', 'fail');
          }
        };

        const handleDismiss = () => {
          if (!confirmed) resolve(false);
        };

        present(<CommunityPolicyContent onConfirm={handleConfirm} isPending={isPending} />, {
          snapPoints: ['40%'],
          onDismiss: handleDismiss
        });
      });
    },
    [refetch, mutateAsync, isPending, present, dismiss]
  );

  return { requirePolicy };
};
