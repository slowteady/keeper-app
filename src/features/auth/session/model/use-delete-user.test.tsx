import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { InteractionManager } from 'react-native';

import { deleteUser } from '@/entities/auth';
import { removeToken } from '@/shared/lib';
import { useLoadingOverlay } from '@/shared/ui';
import { createWrapper } from '@/test/create-wrapper';

import { useSetIsAuthenticated } from '../../lib/auth-state';
import { signOutSocialSession } from '../../lib/sign-out-social-session';
import { useDeleteUser } from './use-delete-user';

jest.mock('@/entities/auth', () => ({
  ...jest.requireActual('@/entities/auth'),
  deleteUser: jest.fn()
}));
jest.mock('@/shared/lib', () => ({
  ...jest.requireActual('@/shared/lib'),
  removeToken: jest.fn(),
  globalToast: jest.fn()
}));
jest.mock('../../lib/auth-state', () => ({ useSetIsAuthenticated: jest.fn() }));
jest.mock('../../lib/sign-out-social-session', () => ({ signOutSocialSession: jest.fn() }));

describe('useDeleteUser', () => {
  const hide = jest.fn();
  const show = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useLoadingOverlay as jest.Mock).mockReturnValue({ show, hide });
    (useSetIsAuthenticated as jest.Mock).mockReturnValue(jest.fn());
    (removeToken as jest.Mock).mockResolvedValue(undefined);
    (signOutSocialSession as jest.Mock).mockResolvedValue(undefined);
    jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(((cb: () => void) => {
      cb();
      return { then: jest.fn(), done: jest.fn(), cancel: jest.fn() };
    }) as never);
  });

  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('deleteUser');
    expect(result.current).toHaveProperty('openWithdrawModal');
    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.deleteUser).toBe('function');
    expect(typeof result.current.openWithdrawModal).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });

  it('성공 시 오버레이를 먼저 내리고 그 다음 프로필로 이동한다 (모달 겹침 방지)', async () => {
    (deleteUser as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.deleteUser({ reason: 'OTHER' });
    });

    expect(hide).toHaveBeenCalled();
    expect(router.dismissTo).toHaveBeenCalledWith('/(tabs)/profile');
    expect(hide.mock.invocationCallOrder[0]).toBeLessThan((router.dismissTo as jest.Mock).mock.invocationCallOrder[0]);
    expect(InteractionManager.runAfterInteractions).toHaveBeenCalled();
  });

  it('실패 시 이동하지 않고 오버레이만 내린다', async () => {
    (deleteUser as jest.Mock).mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.deleteUser({ reason: 'OTHER' });
    });

    await waitFor(() => expect(hide).toHaveBeenCalled());
    expect(router.dismissTo).not.toHaveBeenCalled();
  });
});
