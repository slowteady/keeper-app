import { renderHook } from '@testing-library/react-native';

import { useReview } from './useReview';

describe('useReview', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useReview());

    expect(result.current).toHaveProperty('promptReview');
    expect(typeof result.current.promptReview).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useReview());

    expect(result.current).not.toHaveProperty('actions');
  });
});
