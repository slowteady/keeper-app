import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useDeleteUser } from './use-delete-user';

describe('useDeleteUser', () => {
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
});
