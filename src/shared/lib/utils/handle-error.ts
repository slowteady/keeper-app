import { AxiosError } from 'axios';

export const logger = {
  log: (...args: unknown[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (__DEV__) {
      console.warn(...args);
    }
  },

  error: (...args: unknown[]) => {
    if (__DEV__) {
      console.error(...args);
    }
  },

  debug: (...args: unknown[]) => {
    if (__DEV__) {
      console.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: unknown[]) => {
    if (__DEV__) {
      console.info('[INFO]', ...args);
    }
  }
};

export const throwToErrorBoundary = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (!status) return true;
    return status >= 500;
  }

  return true;
};
