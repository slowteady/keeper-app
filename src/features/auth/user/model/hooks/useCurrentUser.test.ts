import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useCurrentUser } from './useCurrentUser';

describe('useCurrentUser', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoggedIn');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('flags');
  });
});
