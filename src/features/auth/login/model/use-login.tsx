import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { isAvailableAsync } from 'expo-apple-authentication';
import { Route, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { agree, AgreeBodyDto, login, LoginDataDto, SocialLoginType } from '@/entities/auth';
import { publicApi } from '@/shared/api/instance';
import { globalToast, saveAccessToken, saveRefreshToken, setUserContext } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';
import { useBottomSheet } from '@/shared/ui';

import { PRIVACY_VERSION, TERMS_VERSION } from '../../lib/agreement';
import { useSetIsAuthenticated } from '../../lib/auth-state';
import { completeAuth } from '../../lib/complete-auth';
import { AgreementState, SignupAgreementSheet } from '../../signup/ui';

const resolveRedirect = (redirect?: Route): Route | undefined => {
  if (!redirect || redirect === '/login') return undefined;
  return redirect;
};

const INITIAL_AGREEMENT: AgreementState = { age14: false, terms: false, privacy: false };

export const useLogin = () => {
  const { redirect } = useLocalSearchParams<{ redirect?: Route }>();

  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(false);

  const { mutate, isPending } = useMutation({ mutationFn: login });
  const { mutateAsync: agreeAsync, isPending: isAgreePending } = useMutation({ mutationFn: agree });

  const queryClient = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();
  const { present, dismiss, update } = useBottomSheet();

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
    async (data: LoginDataDto) => {
      const { accessToken, refreshToken, nickname } = data;
      // agree API 가 authApi (JWT 필요) 라 BottomSheet 진입 전 저장. 닫기 시 agreed_at=NULL 로 다음 진입에서 다시 isNew.
      await saveAccessToken(accessToken);
      await saveRefreshToken(refreshToken);

      let agreement: AgreementState = INITIAL_AGREEMENT;

      const handleConfirm = async () => {
        if (!(agreement.age14 && agreement.terms && agreement.privacy)) return;
        const body: AgreeBodyDto = {
          agreedTermsVersion: TERMS_VERSION,
          agreedPrivacyVersion: PRIVACY_VERSION,
          agreedAt: new Date().toISOString()
        };
        const res = await agreeAsync(body);
        const result = res.data.data;
        const { accessToken: nextAccess, refreshToken: nextRefresh, ...user } = result;
        dismiss();
        await completeAuth({
          accessToken: nextAccess,
          refreshToken: nextRefresh,
          user,
          toastMessage: '회원가입이 완료되었어요',
          redirect: resolveRedirect(redirect) ?? '/',
          queryClient,
          setIsAuthenticated
        });
      };

      const renderSheet = (current: AgreementState) => (
        <SignupAgreementSheet
          nickname={nickname ?? ''}
          agreement={current}
          onAgreementChange={(next) => {
            agreement = next;
            update(renderSheet(next));
          }}
          onConfirm={handleConfirm}
          onClose={() => dismiss()}
          isPending={isAgreePending}
        />
      );

      present(renderSheet(INITIAL_AGREEMENT), { snapPoints: ['55%'], mandatory: true });
    },
    [agreeAsync, dismiss, isAgreePending, present, queryClient, redirect, setIsAuthenticated, update]
  );

  const handleLogin = useCallback(
    (socialType: SocialLoginType, token: string) => {
      mutate(
        { socialType, token },
        {
          onSuccess: async ({ data: resultData }) => {
            const { data } = resultData;
            const { isNew } = data;

            if (isNew) {
              await openAgreementSheet(data);
              return;
            }

            const { accessToken, refreshToken, socialId: _s, isNew: _n, ...user } = data;
            await completeAuth({
              accessToken,
              refreshToken,
              user,
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

  // [DEV ONLY] 개발자 로그인 — 소셜 인증 우회. NODE_ENV=local 백엔드에서만 작동
  // 운영 빌드(__DEV__=false)에선 UI 자체 노출 안 됨
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
