import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { Platform } from 'react-native';

import { agree, AgreeBodyDto, login } from '@/entities/auth';
import { SocialAuthResult } from '@/shared/api';
import { publicApi } from '@/shared/api/instance';
import { getSuspensionDetail, globalToast, isSuspendedError, setSuspended } from '@/shared/lib';
import { ApiResponse } from '@/shared/model';
import { useBottomSheet } from '@/shared/ui';

import { COMMUNITY_POLICY_VERSION, PRIVACY_VERSION, TERMS_VERSION } from '../../lib/agreement';
import { useSetIsAuthenticated } from '../../lib/auth-state';
import { completeAuth } from '../../lib/complete-auth';
import type { AgreementState } from '../../signup/ui';
import { INITIAL_LOGIN_SHEET, loginSheetAtom } from './login-sheet-atom';

const SHARE_URL = process.env.EXPO_PUBLIC_SHARE_URL;

export type PolicyType = 'terms' | 'privacy' | 'community';

const isAppleAvailable = Platform.OS === 'ios';
const isGoogleAvailable = Platform.OS === 'android';

export const useLoginSheet = () => {
  const [sheet, setSheet] = useAtom(loginSheetAtom);
  const queryClient = useQueryClient();
  const setIsAuthenticated = useSetIsAuthenticated();
  const { dismiss, ref } = useBottomSheet();

  const { mutate: loginMutate, isPending: isLoginPending } = useMutation({
    mutationFn: login,
    onError: (error) => {
      if (isSuspendedError(error)) {
        dismiss();
        setSheet(INITIAL_LOGIN_SHEET);
        setSuspended(getSuspensionDetail(error));
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const data = error.response.data as { error?: string; message?: string };
        if (data?.error === 'ALREADY_REGISTERED' && data.message) {
          globalToast(data.message, 'fail');
          return;
        }
      }
      globalToast('로그인하지 못했어요', 'fail');
    }
  });
  const { mutateAsync: agreeAsync, isPending: isAgreePending } = useMutation({ mutationFn: agree });

  const finish = useCallback(
    async (accessToken: string, refreshToken: string) => {
      dismiss();
      setSheet(INITIAL_LOGIN_SHEET);
      await completeAuth({ accessToken, refreshToken, queryClient, setIsAuthenticated });
    },
    [dismiss, setSheet, queryClient, setIsAuthenticated]
  );

  const onSocialResponse = useCallback(
    ({ socialType, token }: SocialAuthResult) => {
      loginMutate(
        { socialType, token },
        {
          onSuccess: async ({ data: resultData }) => {
            const { isNew, signupToken, accessToken, refreshToken } = resultData.data;

            if (isNew) {
              if (!signupToken) {
                globalToast('회원가입하지 못했어요', 'fail');
                return;
              }
              setSheet((prev) => ({ ...prev, step: 'agreement', signupToken }));
              return;
            }

            if (!accessToken || !refreshToken) return;
            await finish(accessToken, refreshToken);
          }
        }
      );
    },
    [loginMutate, setSheet, finish]
  );

  const devLogin = useCallback(
    async (userId: number) => {
      try {
        const res = await publicApi.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `/auth/dev-login/${userId}`
        );
        const { accessToken, refreshToken } = res.data.data;
        await finish(accessToken, refreshToken);
      } catch {
        globalToast('개발자 로그인 실패 — 백엔드 NODE_ENV=local 확인', 'fail');
      }
    },
    [finish]
  );

  const setAgreements = useCallback(
    (next: AgreementState) => setSheet((prev) => ({ ...prev, agreements: next })),
    [setSheet]
  );

  const { age14, terms, privacy, community } = sheet.agreements;
  const allRequiredAgreed = age14 && terms && privacy && community;

  const submitAgreement = useCallback(async () => {
    if (!allRequiredAgreed || !sheet.signupToken) return;

    const body: AgreeBodyDto = {
      signupToken: sheet.signupToken,
      agreedTermsVersion: TERMS_VERSION,
      agreedPrivacyVersion: PRIVACY_VERSION,
      agreedCommunityPolicyVersion: COMMUNITY_POLICY_VERSION,
      agreedAt: new Date().toISOString()
    };

    const res = await agreeAsync(body);
    const { accessToken, refreshToken } = res.data.data;
    if (!accessToken || !refreshToken) return;
    await finish(accessToken, refreshToken);
  }, [allRequiredAgreed, sheet.signupToken, agreeAsync, finish]);

  const viewPolicy = useCallback(
    async (type: PolicyType) => {
      dismiss();
      await WebBrowser.openBrowserAsync(`${SHARE_URL}/policy/${type}`);
      ref.current?.present();
    },
    [dismiss, ref]
  );

  const back = useCallback(() => setSheet((prev) => ({ ...prev, step: 'social' })), [setSheet]);

  return {
    step: sheet.step,
    isAppleAvailable,
    isGoogleAvailable,
    onSocialResponse,
    devLogin,
    agreements: sheet.agreements,
    setAgreements,
    allRequiredAgreed,
    submitAgreement,
    viewPolicy,
    back,
    isPending: isLoginPending || isAgreePending
  };
};
