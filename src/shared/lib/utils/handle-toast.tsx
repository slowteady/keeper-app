import { toast as sonnerToast } from 'sonner-native';

import { ToastContent } from '@/shared/ui';

type ToastStatus = 'success' | 'fail';

export const globalToast = (message: string, status?: ToastStatus) => {
  sonnerToast.custom(<ToastContent message={message} status={status} />, { duration: 2000 });
};
