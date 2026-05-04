type ToastStatus = 'success' | 'fail';

type ShowToastFn = (message: string, options?: { customData?: { status: ToastStatus } }) => void;

let showFn: ShowToastFn | null = null;

export const setToastRef = (fn: ShowToastFn) => {
  showFn = fn;
};

export const globalToast = (message: string, status?: ToastStatus) => {
  showFn?.(message, status ? { customData: { status } } : undefined);
};
