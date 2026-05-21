import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { agree, AgreeBodyDto, login, SocialLoginType } from '@/entities/auth';
import { publicApi } from '@/shared/api/instance';
import { globalToast, setUserContext } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';
import { useBottomSheet } from '@/shared/ui';

import { COMMUNITY_POLICY_VERSION, PRIVACY_VERSION, TERMS_VERSION } from '../../lib/agreement';
import { useSetIsAuthenticated } from '../../lib/auth-state';
import { completeAuth } from '../../lib/complete-auth';
import { AgreementState, SignupAgreementSheet } from '../../signup/ui';

const resolveRedirect = (redirect?: Route): Route | undefined => {
  if (!redirect || redirect === '/login') return undefined;
  return redirect;
};

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const { mutate, isPending } = useMutation({ mutationFn: login });
  const { mutateAsync: agreeAsync, isPending: isAgreePending } = useMutation({ mutationFn: agree });

  const queryClient = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();
  const { present, dismiss } = useBottomSheet();

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

  const openAgreementSheet = useCallback(
    (signupToken: string) => {
      const handleConfirm = async (agreement: AgreementState) => {
        if (!(agreement.age14 && agreement.terms && agreement.privacy && agreement.community)) return;
        const body: AgreeBodyDto = {
          signupToken,
          agreedTermsVersion: TERMS_VERSION,
          agreedPrivacyVersion: PRIVACY_VERSION,
          agreedCommunityPolicyVersion: COMMUNITY_POLICY_VERSION,
          agreedAt: new Date().toISOString()
        };
        const res = await agreeAsync(body);
        const result = res.data.data;
        const { accessToken, refreshToken, ...user } = result;
        if (!accessToken || !refreshToken) return;
        dismiss();
        await completeAuth({
          accessToken,
          refreshToken,
          user: user as Parameters<typeof setUserContext>[0],
          toastMessage: '회원가입이 완료되었어요',
          redirect: resolveRedirect(redirect) ?? '/',
          queryClient,
          setIsAuthenticated
        });
      };

      present(<SignupAgreementSheet onConfirm={handleConfirm} onClose={dismiss} isPending={isAgreePending} />, {
        snapPoints: ['55%'],
        mandatory: true
      });
    },
    [agreeAsync, dismiss, isAgreePending, present, queryClient, redirect, setIsAuthenticated]
  );

  const handleLogin = useCallback(
    (socialType: SocialLoginType, token: string) => {
      mutate(
        { socialType, token },
        {
          onSuccess: async ({ data: resultData }) => {
            const { data } = resultData;
            const { isNew, signupToken, accessToken, refreshToken, socialId: _s, isNew: _n, ...user } = data;

            if (isNew) {
              if (!signupToken) {
                globalToast('회원가입 진행에 실패했어요', 'fail');
                return;
              }
              openAgreementSheet(signupToken);
              return;
            }

            if (!accessToken || !refreshToken) return;
            await completeAuth({
              accessToken,
              refreshToken,
              user: user as Parameters<typeof setUserContext>[0],
              toastMessage: '로그인 되었어요',
              redirect: resolveRedirect(redirect) ?? '/',
              queryClient,
              setIsAuthenticated
            });
          },
          onError: () => {
            globalToast('로그인에 실패했어요 다시 시도해주세요', 'fail');
          }
        }
      );
    },
    [mutate, openAgreementSheet, queryClient, redirect, setIsAuthenticated]
  );

  const handleDevLogin = useCallback(
    async (userId: number) => {
      try {
        const res = await publicApi.post<
          ApiResponse<{ accessToken: string; refreshToken: string; [k: string]: unknown }>
        >(`/auth/dev-login/${userId}`);
        const { accessToken, refreshToken, socialId: _s, isNew: _n, ...user } = res.data.data;
        await completeAuth({
          accessToken,
          refreshToken,
          user: user as Parameters<typeof setUserContext>[0],
          toastMessage: '개발자 로그인 되었어요',
          redirect: resolveRedirect(redirect) ?? '/',
          queryClient,
          setIsAuthenticated
        });
      } catch {
        globalToast('개발자 로그인 실패 — 백엔드 NODE_ENV=local 확인', 'fail');
      }
    },
    [queryClient, redirect, setIsAuthenticated]
  );

  return { login: handleLogin, devLogin: handleDevLogin, isPending, isAppleAvailable, isGoogleAvailable };
};
