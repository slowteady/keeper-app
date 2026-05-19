import { act, renderHook, waitFor } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useRequireCommunityPolicy } from './use-require-community-policy';

const mockMutateAsync = jest.fn();
const mockRefetch = jest.fn();
const mockPresent = jest.fn();
const mockDismiss = jest.fn();
let mockAgreed = false;

jest.mock('./use-community-policy', () => ({
  useCommunityPolicyStatus: () => ({
    data: { agreed: mockAgreed, version: null, agreedAt: null },
    refetch: mockRefetch
  }),
  useAgreeCommunityPolicy: () => ({ mutateAsync: mockMutateAsync })
}));

jest.mock('@/features/auth', () => ({
  useLoginRequired: () => ({ isLoggedIn: true, requireLogin: async (cb?: () => void) => cb?.() })
}));

jest.mock('@/shared/ui', () => {
  const actual = jest.requireActual('@/shared/ui');
  return { ...actual, useBottomSheet: () => ({ present: mockPresent, dismiss: mockDismiss }) };
});

describe('useRequireCommunityPolicy', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset();
    // refetch 호출 시점에 mockAgreed 의 최신 값을 반환하도록 함수형 mock 으로 — 각 테스트가 mockAgreed 를 변경하므로.
    mockRefetch.mockReset().mockImplementation(async () => ({ data: { agreed: mockAgreed } }));
    mockPresent.mockReset();
    mockDismiss.mockReset();
  });

  it('이미 동의 상태면 callback 즉시 실행 + present 호출 없음 + true 반환', async () => {
    mockAgreed = true;
    const cb = jest.fn();
    const { result } = renderHook(() => useRequireCommunityPolicy(), { wrapper: createWrapper() });

    const ok = await act(async () => result.current.requirePolicy(cb));

    expect(cb).toHaveBeenCalledTimes(1);
    expect(mockPresent).not.toHaveBeenCalled();
    expect(ok).toBe(true);
  });

  it('미동의 상태면 present 호출 + callback 즉시 실행 안 함', async () => {
    mockAgreed = false;
    const cb = jest.fn();
    const { result } = renderHook(() => useRequireCommunityPolicy(), { wrapper: createWrapper() });

    act(() => {
      void result.current.requirePolicy(cb);
    });

    await waitFor(() => expect(mockPresent).toHaveBeenCalled());
    expect(cb).not.toHaveBeenCalled();
  });

  it('미동의 → 사용자 dismiss → callback 미실행 + false resolve', async () => {
    mockAgreed = false;
    const cb = jest.fn();
    const { result } = renderHook(() => useRequireCommunityPolicy(), { wrapper: createWrapper() });

    let resultPromise: Promise<boolean> | undefined;
    act(() => {
      resultPromise = result.current.requirePolicy(cb);
    });

    await waitFor(() => expect(mockPresent).toHaveBeenCalled());

    const opts = mockPresent.mock.calls[0][1] as { onDismiss?: () => void };
    act(() => opts.onDismiss?.());

    const ok = await resultPromise;
    expect(cb).not.toHaveBeenCalled();
    expect(ok).toBe(false);
  });
});
