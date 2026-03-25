import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useShelterAdoptList } from './useShelterAdoptList';

describe('useShelterAdoptList', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShelterAdoptList({ id: '1' }), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('selectedFilter');
    expect(result.current).toHaveProperty('originalData');
    expect(result.current).toHaveProperty('convertedData');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(result.current).toHaveProperty('isFetchingNextPage');
    expect(typeof result.current.changeFilter).toBe('function');
    expect(typeof result.current.executeRefresh).toBe('function');
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
