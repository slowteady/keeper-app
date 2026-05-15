import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { authQueries, login, SocialLoginType } from '@/entities/auth';
import { publicApi } from '@/shared/api/instance';
import { globalToast, saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';

import { useSetIsAuthenticated } from '../../lib/auth-state';

const resolveRedirect = (redirect?: Route): Route | undefined => {
  if (!redirect || redirect === '/login') return undefined;
  return redirect;
};

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const { mutate, isPending } = useMutation({ mutationFn: login });

  const queryClient = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();

  useEffect(() => {
    (async () => {
      try {
        const [appleAvailable, googleAvailable] = await Promise.all([
          isAvailableAsync(),
          GoogleSignin.hasPlayServices()
        ]);
        setIsAppleAvailable(appleAvailable);
        setIsGoogleAvailable(googleAvailable);
      } catch {
        setIsAppleAvailable(false);
        setIsGoogleAvailable(false);
      }
    })();
  }, []);

  const handleLogin = useCallback(
    (socialType: SocialLoginType, token: string) => {
      mutate(
        { socialType, token },
        {
          onSuccess: async ({ data: resultData }) => {
            const { data } = resultData;
            const { accessToken, refreshToken, socialId, isNew, ...user } = data;

            if (isNew) {
              router.push({
                pathname: '/signup',
                params: { socialType, socialId, redirect }
              });
              return;
            }

            await saveAccessToken(accessToken);
            await saveRefreshToken(refreshToken);
            setUserContext(user);

            queryClient.invalidateQueries({ queryKey: authQueries.all() });
            globalToast('로그인 되었어요', 'success');
            router.replace(resolveRedirect(redirect) ?? '/');
            setIsAuthenticated(true);
          },
          onError: () => {
            globalToast('로그인에 실패했어요 다시 시도해주세요', 'fail');
          }
        }
      );
    },
    [mutate, queryClient, redirect, setIsAuthenticated]
  );

  // [DEV ONLY] 개발자 로그인 — 소셜 인증 우회. NODE_ENV=local 백엔드에서만 작동
  // 운영 빌드(__DEV__=false)에선 UI 자체 노출 안 됨
  const handleDevLogin = useCallback(
    async (userId: number) => {
      try {
        const res = await publicApi.post<
          ApiResponse<{ accessToken: string; refreshToken: string; [k: string]: unknown }>
        >(`/auth/dev-login/${userId}`);
        const { accessToken, refreshToken, socialId: _s, isNew: _n, ...user } = res.data.data;
        await saveAccessToken(accessToken);
        await saveRefreshToken(refreshToken);
        setUserContext(user as Parameters<typeof setUserContext>[0]);
        queryClient.invalidateQueries({ queryKey: authQueries.all() });
        globalToast('개발자 로그인 되었어요', 'success');
        router.replace(resolveRedirect(redirect) ?? '/');
        setIsAuthenticated(true);
      } catch {
        globalToast('개발자 로그인 실패 — 백엔드 NODE_ENV=local 확인', 'fail');
      }
    },
    [queryClient, redirect, setIsAuthenticated]
  );

  return { login: handleLogin, devLogin: handleDevLogin, isPending, isAppleAvailable, isGoogleAvailable };
};
