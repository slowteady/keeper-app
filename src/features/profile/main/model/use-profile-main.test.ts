import { renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useCurrentUser } from '@/features/auth';
import { useReview, useShare } from '@/shared/model';

import { useProfileMain } from './use-profile-main';

const mockOpenLoginSheet = jest.fn();
jest.mock('@/features/auth', () => ({
  useCurrentUser: jest.fn(),
  useOpenLoginSheet: () => mockOpenLoginSheet
}));
jest.mock('@/shared/model', () => ({
  useShare: jest.fn(),
  useReview: jest.fn(),
  usePermission: () => ({ goSettingMenu: jest.fn() })
}));

const mockedUseCurrentUser = jest.mocked(useCurrentUser);
const mockedUseShare = jest.mocked(useShare);
const mockedUseReview = jest.mocked(useReview);
const mockedPush = jest.mocked(router.push);

const FAKE_USER = {
  id: 1,
  nickname: 'keeper',
  email: 'a@b.com',
  image: 'https://x'
};

const setupHook = (overrides: { user?: typeof FAKE_USER | null; isLoading?: boolean } = {}) => {
  mockedUseCurrentUser.mockReturnValue({
    user: overrides.user ?? null,
    isLoggedIn: !!overrides.user,
    isLoading: overrides.isLoading ?? false
  } as ReturnType<typeof useCurrentUser>);

  const share = jest.fn();
  const promptReview = jest.fn();
  mockedUseShare.mockReturnValue({ share, isSharing: false } as ReturnType<typeof useShare>);
  mockedUseReview.mockReturnValue({ promptReview } as ReturnType<typeof useReview>);

  return { ...renderHook(() => useProfileMain()), share, promptReview };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useProfileMain', () => {
  it('useCurrentUser 의 user / isLoading 그대로 반환', () => {
    const { result } = setupHook({ user: FAKE_USER, isLoading: true });

    expect(result.current.user).toEqual(FAKE_USER);
    expect(result.current.isLoading).toBe(true);
  });

  it('shareApp 호출 시 앱 링크를 share', () => {
    const { result, share } = setupHook();

    result.current.shareApp();

    expect(share).toHaveBeenCalledWith({ type: 'app' });
  });

  it('goLogin() → 로그인 시트 오픈', () => {
    const { result } = setupHook();

    result.current.goLogin();

    expect(mockOpenLoginSheet).toHaveBeenCalledWith();
  });

  it('goAccount 호출 시 /profile/account 로 push', () => {
    const { result } = setupHook();

    result.current.goAccount();

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/profile/account' });
  });

  it('goActivity 호출 시 /profile/activity 로 push', () => {
    const { result } = setupHook();

    result.current.goActivity();

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/profile/activity' });
  });

  it('goMenu(requireAuth=true) + 미로그인이면 로그인 시트 오픈', () => {
    const { result } = setupHook({ user: null });

    result.current.goMenu('like', true);

    expect(mockOpenLoginSheet).toHaveBeenCalledWith();
  });

  it('goMenu(requireAuth=true) + 로그인 상태면 해당 path 로 push', () => {
    const { result } = setupHook({ user: FAKE_USER });

    result.current.goMenu('like', true);

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/profile/like' });
  });

  it('goMenu(requireAuth=false) 는 미로그인이어도 해당 path 로 push', () => {
    const { result } = setupHook({ user: null });

    result.current.goMenu('notice', false);

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/profile/notice' });
  });
});
