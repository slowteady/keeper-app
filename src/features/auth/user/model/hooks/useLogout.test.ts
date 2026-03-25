import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useLogout } from './useLogout';

describe('useLogout', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.logout).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });
});
