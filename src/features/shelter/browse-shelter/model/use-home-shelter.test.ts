import { renderHook } from '@testing-library/react-native';

import { createWrapper } from '@/test/create-wrapper';

import { useHomeShelter } from './use-home-shelter';

describe('useHomeShelter', () => {
  it('근처 보호소 list 속성만 노출한다', () => {
    const { result } = renderHook(() => useHomeShelter(), { wrapper: createWrapper() });

    expect(result.current).toHaveProperty('shelters');
    expect(result.current).toHaveProperty('isGranted');
    expect(result.current).toHaveProperty('isLoading');
  });

  it('지도·거리카운트 관련 속성은 노출하지 않는다 (보호소 탭 useShelterViewport로 이관)', () => {
    const { result } = renderHook(() => useHomeShelter(), { wrapper: createWrapper() });

    expect(result.current).not.toHaveProperty('shelterCounts');
    expect(result.current).not.toHaveProperty('mapRef');
    expect(result.current).not.toHaveProperty('camera');
    expect(result.current).not.toHaveProperty('onRefetch');
    expect(result.current).not.toHaveProperty('onTapMarker');
  });
});
