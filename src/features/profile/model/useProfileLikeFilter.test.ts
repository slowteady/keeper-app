import { act, renderHook } from '@testing-library/react-native';

import { useProfileLikeFilter } from './useProfileLikeFilter';

describe('useProfileLikeFilter', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useProfileLikeFilter());

    expect(result.current).toHaveProperty('filter');
    expect(result.current).toHaveProperty('toggleFilter');
    expect(result.current.filter).toBe('adopt');
    expect(typeof result.current.toggleFilter).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useProfileLikeFilter());

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('actions');
  });

  it('toggleFilter changes filter value', () => {
    const { result } = renderHook(() => useProfileLikeFilter());

    act(() => {
      result.current.toggleFilter('post');
    });

    expect(result.current.filter).toBe('post');
  });
});
