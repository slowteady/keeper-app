import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { authQueries, login, SocialLoginType } from '@/entities/auth';
import { saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';

const isTabRoute = (path: string) => {
  const tabRoutes = ['/home', '/adopt', '/shelter', '/community', '/profile'];
  return tabRoutes.some((route) => path.startsWith(route));
};

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const { mutate, isPending } = useMutation({ mutationFn: login });

  const { show } = useToastController();
  const queryClient = useQueryClient();

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
              router.replace({
                pathname: '/signup',
                params: { socialType, socialId, redirect }
              });
              return;
            }

            await saveAccessToken(accessToken);
            await saveRefreshToken(refreshToken);
            setUserContext(user);
            queryClient.invalidateQueries({ queryKey: authQueries.all() });

            setTimeout(() => {
              show('로그인 되었어요.', { customData: { status: 'success' } });
            }, 100);

            const targetPath = redirect || '/';

            if (isTabRoute(targetPath)) {
              router.dismissAll();
              router.replace(targetPath);
            } else {
              router.replace(targetPath);
            }
          },
          onError: () => {
            show('로그인에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
          }
        }
      );
    },
    [mutate, queryClient, show, redirect]
  );

  return { login: handleLogin, isPending, isAppleAvailable, isGoogleAvailable };
};
