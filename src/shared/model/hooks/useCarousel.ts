import { useCallback, useRef, useState } from 'react';
import { NativeSyntheticEvent } from 'react-native';
import PagerView from 'react-native-pager-view';

export interface useCarouselProps {
  images: string[];
}

export const useCarousel = ({ images }: useCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef<PagerView | null>(null);

  const changeIndex = useCallback((e: NativeSyntheticEvent<{ position: number }>) => {
    const { position } = e.nativeEvent;
    setCurrentIndex(position);
  }, []);

  const changeCarouselPage = useCallback(
    (type: 'prev' | 'next') => {
      if (!carouselRef.current) return;

      let newIndex = currentIndex;
      if (type === 'prev' && currentIndex > 0) {
        newIndex = currentIndex - 1;
        carouselRef.current.setPage(newIndex);
      } else if (type === 'next' && currentIndex < images.length - 1) {
        newIndex = currentIndex + 1;
        carouselRef.current.setPage(newIndex);
      }
    },
    [currentIndex, images.length]
  );

  return { state: { currentIndex }, actions: { changeIndex, changeCarouselPage }, refs: { carouselRef } };
};
