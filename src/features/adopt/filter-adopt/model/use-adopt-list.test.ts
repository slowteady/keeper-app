import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { AdoptListParams, useAdoptList } from './use-adopt-list';

describe('useAdoptList', () => {
  const defaultParams: AdoptListParams = { filter: 'NEAR_DEADLINE', animalType: 'ALL' };

  it('데이터 페칭 관련 속성을 반환한다', () => {
    const { result } = renderHook(() => useAdoptList(defaultParams), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('convertedData');
    expect(result.current).toHaveProperty('moreButtonText');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isFetchingNextPage');
    expect(result.current).toHaveProperty('hasNextPage');
    expect(typeof result.current.refresh).toBe('function');
    expect(typeof result.current.fetchNextPage).toBe('function');
  });

  it('필터/네비게이션 관련 속성을 포함하지 않는다', () => {
    const { result } = renderHook(() => useAdoptList(defaultParams), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('selectedFilter');
    expect(result.current).not.toHaveProperty('selectedType');
    expect(result.current).not.toHaveProperty('changeFilter');
    expect(result.current).not.toHaveProperty('goDetail');
    expect(result.current).not.toHaveProperty('goList');
    expect(result.current).not.toHaveProperty('originalData');
    expect(result.current).not.toHaveProperty('isFetching');
  });
});
