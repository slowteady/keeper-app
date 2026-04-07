import { act, renderHook } from '@testing-library/react-native';
import { NativeSyntheticEvent } from 'react-native';

import { useCarousel } from './use-carousel';

describe('useCarousel', () => {
  it('초기 인덱스는 0이다', () => {
    const { result } = renderHook(() => useCarousel(5));

    expect(result.current.currentIndex).toBe(0);
  });

  it('handlePageChange로 인덱스를 변경한다', () => {
    const { result } = renderHook(() => useCarousel(5));

    act(() => {
      result.current.handlePageChange({
        nativeEvent: { position: 3 }
      } as NativeSyntheticEvent<{ position: number }>);
    });

    expect(result.current.currentIndex).toBe(3);
  });

  it('goTo next가 범위를 초과하면 이동하지 않는다', () => {
    const { result } = renderHook(() => useCarousel(1));

    act(() => {
      result.current.goTo('next');
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('goTo prev가 0 미만이면 이동하지 않는다', () => {
    const { result } = renderHook(() => useCarousel(5));

    act(() => {
      result.current.goTo('prev');
    });

    expect(result.current.currentIndex).toBe(0);
  });

  it('flat 객체를 반환한다', () => {
    const { result } = renderHook(() => useCarousel(5));

    expect(result.current).toHaveProperty('currentIndex');
    expect(result.current).toHaveProperty('handlePageChange');
    expect(result.current).toHaveProperty('goTo');
    expect(result.current).toHaveProperty('carouselRef');
    expect(result.current).not.toHaveProperty('state');
    expect(result.current).not.toHaveProperty('actions');
    expect(result.current).not.toHaveProperty('refs');
  });
});
