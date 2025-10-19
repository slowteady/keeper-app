import * as Sentry from '@sentry/react-native';

/**
 * 사용자 컨텍스트 설정 (로그인 시 호출)
 */
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username
  });
};

/**
 * 사용자 컨텍스트 제거 (로그아웃 시 호출)
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
