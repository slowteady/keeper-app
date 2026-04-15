import { renderHook } from '@testing-library/react-native';

import { useLocation } from './use-location';

describe('useLocation', () => {
  it('returns correct properties', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current).toHaveProperty('userLocation');
    expect(result.current).toHaveProperty('isGranted');
    expect(result.current).toHaveProperty('permissionStatus');
    expect(typeof result.current.isGranted).toBe('boolean');
  });

  it('isGranted is false initially', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.isGranted).toBe(false);
  });

  it('userLocation is undefined initially', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current.userLocation).toBeUndefined();
  });
});
