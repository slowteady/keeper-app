import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useToastController } from '@tamagui/toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { login, SocialLoginType } from '@/entities';
import { saveAccessToken, saveRefreshToken, setUserContext, USER_QUERY_KEY } from '@/shared';

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, isSetAppleAvailable] = useState<boolean | null>(null);
  const [isGoogleAvailable, isSetGoogleAvailable] = useState<boolean | null>(null);

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
        isSetAppleAvailable(appleAvailable);
        isSetGoogleAvailable(googleAvailable);
      } catch {
        isSetAppleAvailable(false);
        isSetGoogleAvailable(false);
      }
    })();
  }, []);

  const executeLogin = useCallback(
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
            queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
            show('로그인 되었어요.', { customData: { status: 'success' } });

            router.replace(redirect || '/');
          },
          onError: () => {
            show('로그인에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
          }
        }
      );
    },
    [mutate, queryClient, show, redirect]
  );

  return {
    actions: { executeLogin },
    flags: { isPending, isAppleAvailable, isGoogleAvailable }
  };
};
