import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useShelterAdoptList } from './use-shelter-adopt-list';

describe('useShelterAdoptList', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShelterAdoptList({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('selectedFilter');
    expect(result.current).toHaveProperty('convertedData');
    expect(result.current).toHaveProperty('moreButtonText');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(result.current).toHaveProperty('isFetchingNextPage');
    expect(typeof result.current.changeFilter).toBe('function');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.fetchNextPage).toBe('function');
    expect(typeof result.current.goDetail).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useShelterAdoptList({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('flags');
    expect(result.current).not.toHaveProperty('actions');
  });
});
