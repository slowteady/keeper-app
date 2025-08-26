import { useRouter } from 'expo-router';
import React, { ReactNode,useEffect } from 'react';
import { Spinner, View } from 'tamagui';

import { useAuthContext } from './AuthProvider';

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireAuth?: boolean;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // 인증이 필요한데 인증되지 않은 경우 로그인 페이지로 이동
        router.replace('/login');
      } else if (!requireAuth && isAuthenticated) {
        // 인증이 필요 없는데 인증된 경우 메인 페이지로 이동
        router.replace('/(app)');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  if (isLoading) {
    return (
      fallback || (
        <View flex={1} justifyContent="center" alignItems="center">
          <Spinner size="large" color="$primary" />
        </View>
      )
    );
  }

  // 인증 상태가 요구사항과 맞지 않으면 빈 화면 표시
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
