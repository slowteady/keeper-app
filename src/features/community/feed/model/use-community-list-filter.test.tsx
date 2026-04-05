import { renderHook } from '@testing-library/react-native';

import { useCommunityListFilter } from './use-community-list-filter';

describe('useCommunityListFilter', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useCommunityListFilter());

    expect(result.current).toHaveProperty('selectedAnimalType');
    expect(result.current).toHaveProperty('selectedFilter');
    expect(typeof result.current.changeAnimalType).toBe('function');
    expect(typeof result.current.changeFilter).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useCommunityListFilter());

    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('actions');
  });
});
