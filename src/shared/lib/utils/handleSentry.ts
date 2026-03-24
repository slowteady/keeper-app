import * as Sentry from '@sentry/react-native';

interface SentryUser {
  id: string;
  name: string;
  nickname: string;
  email: string;
}

/**
 * 센트리 사용자 컨텍스트 설정
 */
export const setUserContext = (user: SentryUser) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.name,
    nickname: user.nickname
  });
};

/**
 * 사용자 컨텍스트 제거
 */
export const clearUserContext = () => {
  Sentry.setUser(null);
};

/**
 * 커스텀 태그 설정
 */
export const setErrorTag = (key: string, value: string) => {
  Sentry.setTag(key, value);
};

/**
 * 커스텀 컨텍스트 설정
 */
export const setErrorContext = (key: string, context: any) => {
  Sentry.setContext(key, context);
};
