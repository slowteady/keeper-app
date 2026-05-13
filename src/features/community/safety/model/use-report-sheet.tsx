import { BottomSheetFooter } from '@gorhom/bottom-sheet';
import { useCallback } from 'react';

import { useBottomSheet } from '@/shared/ui';

import { ReportReasonSheetContent, ReportReasonSheetFooterButton } from '../ui/report-reason-sheet';
import { useResetReportReasonState } from './report-reason-state';
import { type ReportTarget, useReport } from './use-report';

export const useReportSheet = () => {
  const { present, dismiss } = useBottomSheet();
  const { report, isPending } = useReport();
  const resetReportState = useResetReportReasonState();

  const openReportSheet = useCallback(
    (target: ReportTarget) => {
      // 시트 열 때마다 이전 선택값 초기화
      resetReportState();

      const handleSubmit = async (reason: Parameters<typeof report>[1], reasonDetail?: string) => {
        await report(target, reason, reasonDetail);
        dismiss();
      };

      present(<ReportReasonSheetContent />, {
        snapPoints: ['60%'],
        onDismiss: resetReportState,
        // BottomSheetFooter 로 wrap — sticky 하단 고정 + 키보드 대응 (BP)
        footerComponent: (footerProps) => (
          <BottomSheetFooter {...footerProps} bottomInset={0}>
            <ReportReasonSheetFooterButton isPending={isPending} onSubmit={handleSubmit} />
          </BottomSheetFooter>
        )
      });
    },
    [present, dismiss, report, isPending, resetReportState]
  );

  return { openReportSheet, isPending };
};
