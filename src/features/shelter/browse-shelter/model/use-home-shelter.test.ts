import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useHomeShelter } from './use-home-shelter';

describe('useHomeShelter', () => {
  it('returns correct properties', () => {
    const { result } = renderHook(() => useHomeShelter(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('shelters');
    expect(result.current).toHaveProperty('shelterCounts');
    expect(result.current).toHaveProperty('mapRef');
    expect(result.current).toHaveProperty('camera');
    expect(result.current).toHaveProperty('selectedMarkerId');
    expect(result.current).toHaveProperty('isGranted');
    expect(result.current).toHaveProperty('isLoading');
    expect(typeof result.current.onMapInitialized).toBe('function');
    expect(typeof result.current.onRefetch).toBe('function');
    expect(typeof result.current.onTapMarker).toBe('function');
  });

  it('does not expose search-related properties', () => {
    const { result } = renderHook(() => useHomeShelter(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('shelterList');
    expect(result.current).not.toHaveProperty('searchLocation');
    expect(result.current).not.toHaveProperty('changeLocation');
    expect(result.current).not.toHaveProperty('isSearchPending');
  });
});
