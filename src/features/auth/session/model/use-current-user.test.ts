import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useCurrentUser } from './use-current-user';

describe('useCurrentUser', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCurrentUser(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isLoggedIn');
    expect(result.current).toHaveProperty('isLoading');
  });
});
