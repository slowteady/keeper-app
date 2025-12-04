import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useToastController } from '@tamagui/toast';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { SocialLoginType, useLogin as useLoginMutation } from '@/entities';
import { saveAccessToken, saveRefreshToken, setUserContext } from '@/shared';

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, isSetAppleAvailable] = useState<boolean | null>(null);
  const [isGoogleAvailable, isSetGoogleAvailable] = useState<boolean | null>(null);

  const { mutate: loginMutate, isPending } = useLoginMutation();
  const { show } = useToastController();

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
      loginMutate(
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
            show('로그인 되었어요.', { customData: { status: 'success' } });

            router.replace(redirect || '/');
          },
          onError: () => {
            show('로그인에 실패했어요. 다시 시도해주세요.', { customData: { status: 'fail' } });
          }
        }
      );
    },
    [loginMutate, redirect, show]
  );

  return {
    actions: { executeLogin },
    flags: { isPending, isAppleAvailable, isGoogleAvailable }
  };
};
