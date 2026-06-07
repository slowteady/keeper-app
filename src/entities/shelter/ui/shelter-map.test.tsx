import { render } from '@testing-library/react-native';
import { View as MockView } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { ShelterMap } from './shelter-map';

jest.mock('@/shared/ui', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <MockView>{children}</MockView>,
  Skeleton: () => <MockView testID="skeleton" />
}));

jest.mock('@mj-studio/react-native-naver-map', () => ({
  NaverMapMarkerOverlay: () => null,
  NaverMapView: () => null
}));

describe('ShelterMap', () => {
  it('위치 권한 확인 중에는 위치설정 버튼을 표시하지 않는다', () => {
    const { queryByText } = render(<ShelterMap hasLocation={false} isLocationPending onRefetch={() => undefined} />, {
      wrapper: createWrapper()
    });

    expect(queryByText('위치설정 바로가기')).toBeNull();
  });

  it('위치 권한이 거부된 경우에만 위치설정 버튼을 표시한다', () => {
    const { getByText } = render(<ShelterMap hasLocation={false} onRefetch={() => undefined} />, {
      wrapper: createWrapper()
    });

    expect(getByText('위치설정 바로가기')).toBeTruthy();
  });
});
