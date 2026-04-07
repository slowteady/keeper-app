import { useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';

export const useCarousel = (totalCount: number) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const handlePageChange = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
    setCurrentIndex(e.nativeEvent.position);
  }, []);

  const goTo = useCallback(
    (type: 'prev' | 'next') => {
      if (!carouselRef.current) return;

      const newIndex = type === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= totalCount) return;

      carouselRef.current.setPage(newIndex);
    },
    [currentIndex, totalCount]
  );

  return { currentIndex, handlePageChange, goTo, carouselRef };
};
