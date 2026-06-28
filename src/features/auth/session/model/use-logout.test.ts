import { act, renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useLogout } from './use-logout';

const mockDeletePushToken = jest.fn().mockResolvedValue(undefined);
const mockGetExpoPushTokenAsync = jest.fn().mockResolvedValue({ data: 'ExponentPushToken[device]' });

jest.mock('expo-notifications', () => ({
  getExpoPushTokenAsync: (...args: unknown[]) => mockGetExpoPushTokenAsync(...args)
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { eas: { projectId: 'pid' } } } }
}));
jest.mock('@/entities/notification', () => ({
  notificationApi: { deletePushToken: (...args: unknown[]) => mockDeletePushToken(...args) }
}));
jest.mock('@/entities/auth', () => ({
  authQueries: { me: () => ({ queryKey: ['me'] }) },
  logout: jest.fn().mockResolvedValue(undefined)
}));
jest.mock('@/shared/lib', () => ({
  getRefreshToken: jest.fn().mockResolvedValue('refresh-token'),
  removeToken: jest.fn().mockResolvedValue(undefined),
  globalToast: jest.fn()
}));
jest.mock('../../lib/sign-out-social-session', () => ({ signOutSocialSession: jest.fn() }));
jest.mock('@sentry/react-native', () => ({ setUser: jest.fn() }));
jest.mock('expo-router', () => ({ router: { dismissTo: jest.fn() } }));

describe('useLogout', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.logout).toBe('function');
  });

  it('로그아웃 시 이 기기의 푸시 토큰을 백엔드에서 해제한다', async () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.logout();
    });

    expect(mockGetExpoPushTokenAsync).toHaveBeenCalledWith({ projectId: 'pid' });
    expect(mockDeletePushToken).toHaveBeenCalledWith('ExponentPushToken[device]');
  });
});
