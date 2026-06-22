import { useEffect } from 'react';

import { UrgentNoticeDto } from '@/entities/notice';
import { useModal } from '@/shared/ui';

import { isUrgentNoticeDismissed, markUrgentNoticeDismissed } from '../lib/notice-storage';
import { UrgentNoticeModal } from '../ui/urgent-notice-modal';

export const useUrgentNoticeGate = (urgentNotice: UrgentNoticeDto | null) => {
  const { open, close } = useModal();

  useEffect(() => {
    if (!urgentNotice) return;

    let cancelled = false;
    (async () => {
      if (await isUrgentNoticeDismissed(urgentNotice.id)) return;
      if (cancelled) return;
      open(
        <UrgentNoticeModal
          notice={urgentNotice}
          onConfirm={close}
          onDismissForever={async () => {
            await markUrgentNoticeDismissed(urgentNotice.id);
            close();
          }}
        />
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [urgentNotice, open, close]);
};
