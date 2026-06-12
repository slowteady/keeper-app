import { useMutation } from '@tanstack/react-query';

import { commentApi } from '@/entities/comment';
import { communityApi } from '@/entities/community';
import { globalToast } from '@/shared/lib';

export type ReportReason = 'SPAM' | 'ABUSE' | 'FRAUD' | 'ANIMAL_ABUSE' | 'PRIVACY';

export type ReportTarget = { type: 'POST'; id: string } | { type: 'COMMENT'; id: string };

export const useReport = () => {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (input: { target: ReportTarget; reason: ReportReason; reasonDetail?: string }) => {
      const body = { reason: input.reason, reasonDetail: input.reasonDetail };
      if (input.target.type === 'POST') {
        await communityApi.reportPost(input.target.id, body);
      } else {
        await commentApi.report(input.target.id, body);
      }
    }
  });

  const report = async (target: ReportTarget, reason: ReportReason, reasonDetail?: string) => {
    try {
      await mutateAsync({ target, reason, reasonDetail });
      globalToast('신고가 접수됐어요', 'success');
    } catch {
      globalToast('신고하지 못했어요', 'fail');
    }
  };

  return { report, isPending };
};
