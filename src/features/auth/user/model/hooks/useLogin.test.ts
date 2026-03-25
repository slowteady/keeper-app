import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useLogin } from './useLogin';

describe('useLogin', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('isPending');
    expect(result.current).toHaveProperty('isAppleAvailable');
    expect(result.current).toHaveProperty('isGoogleAvailable');
    expect(typeof result.current.login).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useLogin(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });
});
