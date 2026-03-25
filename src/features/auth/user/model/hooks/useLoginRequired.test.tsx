import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useLoginRequired } from './useLoginRequired';

describe('useLoginRequired', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useLoginRequired(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('requireLogin');
    expect(result.current).toHaveProperty('isLoggedIn');
    expect(typeof result.current.requireLogin).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useLoginRequired(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
  });
});
