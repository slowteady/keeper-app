import { renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';

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

  it('isGranted is false when permission denied', () => {
    const mockRequestPermission = jest.fn(() => Promise.resolve({ status: 'denied' }));
    (Location.useForegroundPermissions as jest.Mock).mockReturnValue([{ status: 'denied' }, mockRequestPermission]);

    const { result } = renderHook(() => useLocation());

    expect(result.current.isGranted).toBe(false);
  });
});
