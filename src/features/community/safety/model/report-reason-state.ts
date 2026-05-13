import { atom, useAtom, useSetAtom } from 'jotai';

import type { ReportReason } from './use-report';

// 신고 사유 시트가 한 번에 하나만 떠 있는 가정 — 시트 컨텐츠와 sticky footer 가 상태 공유
const reportReasonAtom = atom<ReportReason | null>(null);
const reportDetailAtom = atom<string>('');

export const useReportReasonState = () => {
  const [reason, setReason] = useAtom(reportReasonAtom);
  const [detail, setDetail] = useAtom(reportDetailAtom);
  return { reason, setReason, detail, setDetail };
};

export const useResetReportReasonState = () => {
  const setReason = useSetAtom(reportReasonAtom);
  const setDetail = useSetAtom(reportDetailAtom);
  return () => {
    setReason(null);
    setDetail('');
  };
};
