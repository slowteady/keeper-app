import { renderHook } from '@testing-library/react-native';

import { useAccount } from './useAccount';

describe('useAccount', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useAccount());

    expect(result.current).toHaveProperty('changeProfileImage');
    expect(result.current).toHaveProperty('openWithdrawModal');
    expect(typeof result.current.changeProfileImage).toBe('function');
    expect(typeof result.current.openWithdrawModal).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useAccount());

    expect(result.current).not.toHaveProperty('actions');
  });
});
