import { renderHook } from '@testing-library/react-native';

import { useShare } from './use-share';

describe('useShare', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current).toHaveProperty('share');
    expect(typeof result.current.share).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useShare());

    expect(result.current).not.toHaveProperty('actions');
  });
});
