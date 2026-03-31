import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useSignup } from './use-signup';

describe('useSignup', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('signup');
    expect(result.current).toHaveProperty('cancel');
    expect(result.current).toHaveProperty('closeModal');
    expect(result.current).toHaveProperty('showCancelModal');
    expect(result.current).toHaveProperty('isPending');
    expect(typeof result.current.signup).toBe('function');
    expect(typeof result.current.cancel).toBe('function');
    expect(typeof result.current.closeModal).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useSignup(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });
});
