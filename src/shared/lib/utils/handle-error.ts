import * as Sentry from '@sentry/react-native';
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
    const cause = args.find((arg) => arg instanceof Error);
    Sentry.captureException(cause ?? new Error(args.map(String).join(' ')));
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

export const getModerationMessage = (error: unknown): string | null => {
  if (!(error instanceof AxiosError)) return null;
  const data = error.response?.data as { error?: string; message?: string } | undefined;
  if (data?.error === 'CONTENT_MODERATION' && typeof data.message === 'string' && data.message.length > 0) {
    return data.message;
  }
  return null;
};

export const throwToErrorBoundary = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    if (!status) return true;
    return status >= 500;
  }

  return true;
};
