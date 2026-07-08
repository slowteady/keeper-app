import { fireEvent, render } from '@testing-library/react-native';
import { Text as MockText, View as MockView } from 'react-native';

import { createWrapper } from '@/test/create-wrapper';

import { HomeMissingHero } from './home-missing-hero';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush })
}));

jest.mock('react-native-pager-view', () => ({
  __esModule: true,
  default: ({ children }: any) => <MockView>{children}</MockView>
}));

let mockFeatured: { items: unknown[]; isLoading: boolean; isError: boolean };
jest.mock('@/features/missing', () => ({
  useFeaturedMissing: () => mockFeatured
}));

jest.mock('./home-banner-section', () => ({
  HomeBannerSection: () => <MockText>banner-fallback</MockText>
}));

const item = {
  id: 'm1',
  uri: 'http://img/1.jpg',
  kind: '진도견',
  region: '전남 영광군',
  date: '2026.07.06',
  specialMark: '흰 코'
};

const IMAGES = ['a', 'b'];

beforeEach(() => {
  mockPush.mockClear();
});

describe('HomeMissingHero', () => {
  it('featured 있으면 첫 슬라이드와 실종·분실 배지를 렌더', () => {
    mockFeatured = { items: [item], isLoading: false, isError: false };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });

    expect(screen.getByText('진도견 · 전남 영광군')).toBeTruthy();
    expect(screen.getByText('2026.07.06')).toBeTruthy();
    expect(screen.getByText('실종·분실')).toBeTruthy();
    expect(screen.queryByText('banner-fallback')).toBeNull();
  });

  it('슬라이드 탭 시 상세로 이동', () => {
    mockFeatured = { items: [item], isLoading: false, isError: false };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });
    fireEvent.press(screen.getByText('진도견 · 전남 영광군'));

    expect(mockPush).toHaveBeenCalledWith({ pathname: '/missing/[id]', params: { id: 'm1' } });
  });

  it('인디케이터 탭 시 실종 목록으로 이동', () => {
    const items = [item, { ...item, id: 'm2' }, { ...item, id: 'm3' }];
    mockFeatured = { items, isLoading: false, isError: false };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });
    fireEvent.press(screen.getByText('1 / 3'));

    expect(mockPush).toHaveBeenCalledWith('/missing');
  });

  it('여러 건이면 슬라이드가 모두 렌더된다', () => {
    const items = [item, { ...item, id: 'm2' }, { ...item, id: 'm3' }];
    mockFeatured = { items, isLoading: false, isError: false };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });

    expect(screen.getAllByText('진도견 · 전남 영광군')).toHaveLength(3);
  });

  it('featured 비어있으면 배너 fallback', () => {
    mockFeatured = { items: [], isLoading: false, isError: false };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });

    expect(screen.getByText('banner-fallback')).toBeTruthy();
    expect(screen.queryByText('전체보기')).toBeNull();
  });

  it('에러 시 배너 fallback', () => {
    mockFeatured = { items: [], isLoading: false, isError: true };

    const screen = render(<HomeMissingHero fallbackImages={IMAGES} />, { wrapper: createWrapper() });

    expect(screen.getByText('banner-fallback')).toBeTruthy();
  });
});
