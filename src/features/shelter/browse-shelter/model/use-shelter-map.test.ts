import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/shared/test/createWrapper';

import { useShelterMap } from './use-shelter-map';

describe('useShelterMap', () => {
  it('returns flat object with correct properties', () => {
    const { result } = renderHook(() => useShelterMap(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('shelters');
    expect(result.current).toHaveProperty('shelterCounts');
    expect(result.current).toHaveProperty('mapRef');
    expect(result.current).toHaveProperty('camera');
    expect(result.current).toHaveProperty('selectedMarkerId');
    expect(result.current).toHaveProperty('shelterList');
    expect(result.current).toHaveProperty('enabled');
    expect(result.current).toHaveProperty('hasLocationStatus');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isSearchPending');
    expect(result.current).toHaveProperty('animatedListStyle');
    expect(typeof result.current.toggleMapEnabled).toBe('function');
    expect(typeof result.current.refetchShelterList).toBe('function');
    expect(typeof result.current.toggleTapMarker).toBe('function');
    expect(typeof result.current.changeLocation).toBe('function');
    expect(typeof result.current.searchLocation).toBe('function');
    expect(typeof result.current.moveCamera).toBe('function');
  });

  it('does not have grouped keys', () => {
    const { result } = renderHook(() => useShelterMap(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('data');
    expect(result.current).not.toHaveProperty('refs');
    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('flags');
    expect(result.current).not.toHaveProperty('styles');
  });
});
