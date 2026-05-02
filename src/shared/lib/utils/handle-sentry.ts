import * as Sentry from '@sentry/react-native';

type SentryUser = {
  id: number;
  name: string;
  nickname: string;
  email: string;
};

/**
 * 센트리 사용자 컨텍스트 설정
 */
export const setUserContext = (user: SentryUser) => {
  Sentry.setUser({
    id: String(user.id),
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
