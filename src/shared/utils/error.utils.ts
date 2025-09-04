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
    }
  },
  error: (...args: any[]) => {
    if (__DEV__) {
      console.error(...args);
    } else {
      // 운영환경에서는 에러 로깅 서비스에 전송 (예: Sentry, Crashlytics 등)
      // 여기서는 콘솔에만 출력하되 더 간단하게
      console.error('[ERROR]', ...args);
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
    }
  }
};

export const handleError = (error: unknown, msg: string): Error => {
  if (error instanceof AxiosError) {
    logger.error(`${msg}: ${error.message}`, {
      response: error.response,
      config: error.config
    });

    throw error;
  }

  throw error;
};
