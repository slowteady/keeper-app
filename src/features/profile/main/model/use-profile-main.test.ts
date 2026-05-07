import { renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { useCurrentUser } from '@/features/auth';
import { useReview, useShare } from '@/shared/model';

import { SHARE_DESC, SHARE_TITLE } from './constants';
import { useProfileMain } from './use-profile-main';

jest.mock('@/features/auth', () => ({
  useCurrentUser: jest.fn()
}));
jest.mock('@/shared/model', () => ({
  useShare: jest.fn(),
  useReview: jest.fn()
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
  mockedUseShare.mockReturnValue({ share } as ReturnType<typeof useShare>);
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

  it('shareApp 호출 시 SHARE_TITLE/SHARE_DESC 로 share', () => {
    const { result, share } = setupHook();

    result.current.shareApp();

    expect(share).toHaveBeenCalledWith({ title: SHARE_TITLE, desc: SHARE_DESC });
  });

  it('goLogin() 기본 redirect 는 "/profile"', () => {
    const { result } = setupHook();

    result.current.goLogin();

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/login', params: { redirect: '/profile' } });
  });

  it('goLogin(path) 로 redirect 지정 가능', () => {
    const { result } = setupHook();

    result.current.goLogin('/profile/like');

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/login', params: { redirect: '/profile/like' } });
  });

  it('goAccount 호출 시 /profile/account 로 push', () => {
    const { result } = setupHook();

    result.current.goAccount();

    expect(mockedPush).toHaveBeenCalledWith({ pathname: '/profile/account' });
  });

  it('goMenu(requireAuth=true) + 미로그인이면 login redirect 로 push', () => {
    const { result } = setupHook({ user: null });

    result.current.goMenu('like', true);

    expect(mockedPush).toHaveBeenCalledWith({
      pathname: '/login',
      params: { redirect: '/profile/like' }
    });
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
