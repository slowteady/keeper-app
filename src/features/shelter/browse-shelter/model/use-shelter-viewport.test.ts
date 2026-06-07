import { act, renderHook, waitFor } from '@testing-library/react-native';

import { ShelterDto } from '@/entities/shelter';
import { useLocation } from '@/shared/model';

import { useShelterViewport } from './use-shelter-viewport';

let mockQueryResult: { data?: ShelterDto[]; isLoading: boolean };

jest.mock('@tanstack/react-query', () => ({
  queryOptions: jest.fn((options) => options),
  useQuery: jest.fn(() => mockQueryResult)
}));

jest.mock('supercluster', () => ({
  __esModule: true,
  default: class {
    private points: unknown[] = [];

    load(points: unknown[]) {
      this.points = points;
    }

    getClusters() {
      return this.points;
    }
  }
}));

jest.mock('@/shared/model', () => ({ useLocation: jest.fn() }));

jest.mock('./shelter-search-coord', () => ({
  useShelterSearchCoord: jest.fn(() => null),
  useSetShelterSearchCoord: jest.fn(() => jest.fn())
}));

const region = {
  latitude: 37,
  longitude: 126,
  latitudeDelta: 2,
  longitudeDelta: 2
};

const shelter = {
  id: 'shelter-1',
  name: '보호소',
  latitude: 37.5,
  longitude: 127
} as ShelterDto;

describe('useShelterViewport', () => {
  beforeEach(() => {
    (useLocation as jest.Mock).mockReturnValue({
      userLocation: { latitude: 37.5, longitude: 127 },
      isGranted: true,
      permissionStatus: 'granted'
    });
  });

  it('첫 카메라 이벤트 뒤 데이터가 도착해도 viewport 계산 완료까지 초기화 상태를 유지한다', async () => {
    mockQueryResult = { data: undefined, isLoading: true };
    const { result, rerender } = renderHook(() => useShelterViewport());

    act(() => result.current.onCameraChange(12, region));

    expect(result.current.isInitializing).toBe(true);
    expect(result.current.shelters).toBeUndefined();

    mockQueryResult = { data: [shelter], isLoading: false };
    rerender({});

    await waitFor(() => {
      expect(result.current.shelters).toEqual([shelter]);
      expect(result.current.isInitializing).toBe(false);
    });
  });

  it('권한 승인 후 위치가 아직 없어도 지도 초기화를 기다릴 수 있다', () => {
    (useLocation as jest.Mock).mockReturnValue({
      userLocation: undefined,
      isGranted: true,
      permissionStatus: 'granted'
    });
    mockQueryResult = { data: undefined, isLoading: false };

    const { result } = renderHook(() => useShelterViewport());

    expect(result.current.isGranted).toBe(true);
    expect(result.current.permissionStatus).toBe('granted');
    expect(result.current.camera).toBeUndefined();
  });
});
