import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useShelterMap } from './use-shelter-map';

describe('useShelterMap', () => {
  it('returns correct properties', () => {
    const { result } = renderHook(() => useShelterMap(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('shelters');
    expect(result.current).toHaveProperty('shelterCounts');
    expect(result.current).toHaveProperty('shelterList');
    expect(result.current).toHaveProperty('mapRef');
    expect(result.current).toHaveProperty('camera');
    expect(result.current).toHaveProperty('selectedMarkerId');
    expect(result.current).toHaveProperty('isGranted');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('isSearchPending');
    expect(typeof result.current.onMapInitialized).toBe('function');
    expect(typeof result.current.onRefetch).toBe('function');
    expect(typeof result.current.onTapMarker).toBe('function');
    expect(typeof result.current.changeLocation).toBe('function');
    expect(typeof result.current.searchLocation).toBe('function');
  });

  it('does not expose internal state', () => {
    const { result } = renderHook(() => useShelterMap(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('enabled');
    expect(result.current).not.toHaveProperty('toggleMapEnabled');
    expect(result.current).not.toHaveProperty('moveCamera');
  });
});
