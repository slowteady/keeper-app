import { UrgentNoticeDto } from '@/entities/notice';

import { useUrgentNoticeGate } from '../model/use-urgent-notice-gate';

export const UrgentNoticeGate = ({ notice }: { notice: UrgentNoticeDto | null }) => {
  useUrgentNoticeGate(notice);
  return null;
};
