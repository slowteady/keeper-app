import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useLogout } from './use-logout';

describe('useLogout', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLogout(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('logout');
    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.logout).toBe('function');
  });
});
