import * as Sentry from '@sentry/react-native';
import { AxiosError } from 'axios';

/**
 * 개발/운영 환경에 따른 로거
 */
export const logger = {
  log: (...args: any[]) => {
    if (__DEV__) {
      console.log(...args);
    }
  },

  warn: (...args: any[]) => {
    if (__DEV__) {
      console.warn(...args);
    } else {
      Sentry.addBreadcrumb({
        message: args.join(' '),
        level: 'warning'
      });
    }
  },

  error: (...args: any[]) => {
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
        Sentry.captureMessage(args.join(' '), 'error');
      }
    }
  },

  debug: (...args: any[]) => {
    if (__DEV__) {
      console.debug('[DEBUG]', ...args);
    }
  },

  info: (...args: any[]) => {
    if (__DEV__) {
      console.info('[INFO]', ...args);
    } else {
      Sentry.addBreadcrumb({
        message: args.join(' '),
        level: 'info'
      });
    }
  }
};

/**
 * API 에러 및 일반 에러 처리
 */
export const handleLogging = (error: unknown, msg: string) => {
  if (error instanceof AxiosError) {
    const errorMessage = `${msg}: ${error.message}`;

    if (__DEV__) {
      console.error(errorMessage);
    } else {
      Sentry.captureException(error);
    }

    return;
  }
};

export const throwToErrorBoundary = (error: unknown) => {
  const err = error as AxiosError;
  const status = err.response?.status;
  if (!status) return true;

  // 클라이언트 에러 (400-499): 컴포넌트에서 처리
  if (status >= 400 && status < 500) {
    return false;
  }

  // 서버 에러 (500+) 또는 네트워크 에러: Error Boundary로
  if (status >= 500 || !status) {
    return true;
  }

  return false;
};
