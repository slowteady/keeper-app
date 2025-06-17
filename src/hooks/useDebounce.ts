import { useCallback, useRef } from 'react';

export const useDebounce = <T extends (...args: any[]) => void>(func: T, delay: number): T => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        func(...args);
      }, delay);
    },
    [func, delay]
  ) as T;
};
