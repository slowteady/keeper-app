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
    } else {
      Sentry.addBreadcrumb({
        message: args.map(String).join(' '),
        level: 'warning'
      });
    }
  },

  error: (...args: unknown[]) => {
    if (__DEV__) {
      console.error(...args);
    } else {
      const error = args[0];
      if (error instanceof Error) {
        Sentry.captureException(error, {
          extra: {
            additionalData: args.slice(1)
          }
        });
      } else {
        Sentry.captureMessage(args.map(String).join(' '), 'error');
      }
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
    } else {
      Sentry.addBreadcrumb({
        message: args.map(String).join(' '),
        level: 'info'
      });
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
