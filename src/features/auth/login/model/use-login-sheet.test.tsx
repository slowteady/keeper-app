import { act, renderHook, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { agree, login } from '@/entities/auth';
import { createWrapper } from '@/test/create-wrapper';

import { completeAuth } from '../../lib/complete-auth';
import { useLoginSheet } from './use-login-sheet';

jest.mock('@/entities/auth', () => ({
  ...jest.requireActual('@/entities/auth'),
  login: jest.fn(),
  agree: jest.fn()
}));
jest.mock('../../lib/complete-auth', () => ({ completeAuth: jest.fn().mockResolvedValue(undefined) }));
jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn().mockResolvedValue(undefined) }));

const mockDismiss = jest.fn();
jest.mock('@/shared/ui', () => ({
  ...jest.requireActual('@/shared/ui'),
  useBottomSheet: () => ({ dismiss: mockDismiss, present: jest.fn(), ref: { current: { present: jest.fn() } } })
}));

const mockLogin = login as jest.Mock;
const mockAgree = agree as jest.Mock;
const mockCompleteAuth = completeAuth as jest.Mock;

// 각 renderHook 을 JotaiProvider 로 감싸 atom 을 테스트별로 격리
const renderUseLoginSheet = () => {
  const Inner = createWrapper();
  return renderHook(() => useLoginSheet(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <JotaiProvider>
        <Inner>{children}</Inner>
      </JotaiProvider>
    )
  });
};

describe('useLoginSheet', () => {
  beforeEach(() => jest.clearAllMocks());

  it('기존 회원 로그인 → completeAuth 호출 + 시트 닫힘', async () => {
    mockLogin.mockResolvedValue({ data: { data: { isNew: false, accessToken: 'a', refreshToken: 'r' } } });
    const { result } = renderUseLoginSheet();

    act(() => result.current.onSocialResponse({ socialType: 'KAKAO', token: 't' }));

    await waitFor(() => expect(mockCompleteAuth).toHaveBeenCalled());
    expect(mockDismiss).toHaveBeenCalled();
  });

  it('신규 회원 → step 이 agreement 로 전환', async () => {
    mockLogin.mockResolvedValue({ data: { data: { isNew: true, signupToken: 'st' } } });
    const { result } = renderUseLoginSheet();

    act(() => result.current.onSocialResponse({ socialType: 'KAKAO', token: 't' }));

    await waitFor(() => expect(result.current.step).toBe('agreement'));
  });

  it('신규 → 전체동의 → submitAgreement → agree + completeAuth', async () => {
    mockLogin.mockResolvedValue({ data: { data: { isNew: true, signupToken: 'st' } } });
    mockAgree.mockResolvedValue({ data: { data: { accessToken: 'a', refreshToken: 'r' } } });
    const { result } = renderUseLoginSheet();

    act(() => result.current.onSocialResponse({ socialType: 'KAKAO', token: 't' }));
    await waitFor(() => expect(result.current.step).toBe('agreement'));

    act(() => result.current.setAgreements({ age14: true, terms: true, privacy: true, community: true }));
    await act(async () => {
      await result.current.submitAgreement();
    });

    expect(mockAgree).toHaveBeenCalled();
    await waitFor(() => expect(mockCompleteAuth).toHaveBeenCalled());
  });

  it('필수 미동의 시 submitAgreement 는 agree 를 호출하지 않음', async () => {
    const { result } = renderUseLoginSheet();

    await act(async () => {
      await result.current.submitAgreement();
    });

    expect(mockAgree).not.toHaveBeenCalled();
  });

  it('setAgreements 전체 true → allRequiredAgreed true', () => {
    const { result } = renderUseLoginSheet();

    act(() => result.current.setAgreements({ age14: true, terms: true, privacy: true, community: true }));

    expect(result.current.allRequiredAgreed).toBe(true);
  });

  it('viewPolicy → 시트 닫고 정책 URL 오픈', async () => {
    const { result } = renderUseLoginSheet();

    await act(async () => {
      await result.current.viewPolicy('terms');
    });

    expect(mockDismiss).toHaveBeenCalled();
    expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith(expect.stringContaining('/policy/terms'));
  });

  it('back → step 이 social 로 복귀', () => {
    const { result } = renderUseLoginSheet();

    act(() => result.current.back());

    expect(result.current.step).toBe('social');
  });
});
