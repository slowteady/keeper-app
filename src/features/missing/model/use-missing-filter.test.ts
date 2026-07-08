import { act, renderHook } from '@testing-library/react-native';
import * as Location from 'expo-location';

import { getKakaoRegionCode } from '@/features/address';

import { NearbyResult, useMissingFilter } from './use-missing-filter';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied', UNDETERMINED: 'undetermined' },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn()
}));

jest.mock('@/features/address', () => ({
  getKakaoRegionCode: jest.fn()
}));

const mockRequest = Location.requestForegroundPermissionsAsync as jest.Mock;
const mockPosition = Location.getCurrentPositionAsync as jest.Mock;
const mockRegion = getKakaoRegionCode as jest.Mock;

const doc = (over: Record<string, string> = {}) => ({
  region_type: 'B',
  code: '1168000000',
  region_1depth_name: '서울특별시',
  region_2depth_name: '강남구',
  region_3depth_name: '역삼동',
  region_4depth_name: '',
  ...over
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useMissingFilter', () => {
  it('권한 허용 시 좌표를 시도/시군구로 해석해 region 설정', async () => {
    mockRequest.mockResolvedValue({ status: 'granted' });
    mockPosition.mockResolvedValue({ coords: { latitude: 37.5, longitude: 127.0 } });
    mockRegion.mockResolvedValue({ data: { documents: [doc()] } });

    const { result } = renderHook(() => useMissingFilter());
    let res: NearbyResult | undefined;
    await act(async () => {
      res = await result.current.applyNearby();
    });

    expect(res).toEqual({ ok: true });
    expect(result.current.region).toEqual({ sido: '서울특별시', sigungu: '강남구' });
    expect(mockRegion).toHaveBeenCalledWith('127', '37.5');
  });

  it('권한 거부 시 reason=permission, 위치 조회하지 않음', async () => {
    mockRequest.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useMissingFilter());
    let res: NearbyResult | undefined;
    await act(async () => {
      res = await result.current.applyNearby();
    });

    expect(res).toEqual({ ok: false, reason: 'permission' });
    expect(result.current.region).toBeNull();
    expect(mockPosition).not.toHaveBeenCalled();
  });

  it('좌표 해석 결과 없으면 reason=resolve', async () => {
    mockRequest.mockResolvedValue({ status: 'granted' });
    mockPosition.mockResolvedValue({ coords: { latitude: 0, longitude: 0 } });
    mockRegion.mockResolvedValue({ data: { documents: [] } });

    const { result } = renderHook(() => useMissingFilter());
    let res: NearbyResult | undefined;
    await act(async () => {
      res = await result.current.applyNearby();
    });

    expect(res).toEqual({ ok: false, reason: 'resolve' });
    expect(result.current.region).toBeNull();
  });

  it('시군구가 비면 sigungu는 undefined', async () => {
    mockRequest.mockResolvedValue({ status: 'granted' });
    mockPosition.mockResolvedValue({ coords: { latitude: 37.5, longitude: 127.0 } });
    mockRegion.mockResolvedValue({ data: { documents: [doc({ region_2depth_name: '' })] } });

    const { result } = renderHook(() => useMissingFilter());
    await act(async () => {
      await result.current.applyNearby();
    });

    expect(result.current.region).toEqual({ sido: '서울특별시', sigungu: undefined });
  });

  it('clear는 region을 null로 되돌린다', async () => {
    mockRequest.mockResolvedValue({ status: 'granted' });
    mockPosition.mockResolvedValue({ coords: { latitude: 37.5, longitude: 127.0 } });
    mockRegion.mockResolvedValue({ data: { documents: [doc()] } });

    const { result } = renderHook(() => useMissingFilter());
    await act(async () => {
      await result.current.applyNearby();
    });
    act(() => {
      result.current.clear();
    });

    expect(result.current.region).toBeNull();
  });
});
