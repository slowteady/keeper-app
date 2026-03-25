import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useAdoptList } from './useAdoptList';

describe('useAdoptList', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useAdoptList(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('selectedFilter');
    expect(result.current).toHaveProperty('selectedType');
    expect(result.current).toHaveProperty('selectedSearch');
    expect(result.current).toHaveProperty('originalData');
    expect(result.current).toHaveProperty('convertedData');
    expect(result.current).toHaveProperty('moreButtonText');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isFetching');
    expect(result.current).toHaveProperty('isFetchingNextPage');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(typeof result.current.changeFilter).toBe('function');
    expect(typeof result.current.changeType).toBe('function');
    expect(typeof result.current.changeSearch).toBe('function');
    expect(typeof result.current.goDetail).toBe('function');
    expect(typeof result.current.goList).toBe('function');
    expect(typeof result.current.executeRefresh).toBe('function');
    expect(typeof result.current.fetchNextPage).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useAdoptList(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('flags');
    expect(result.current).not.toHaveProperty('actions');
  });
});
