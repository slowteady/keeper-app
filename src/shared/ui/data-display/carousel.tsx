import { Image } from 'expo-image';
import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import PagerView, { PagerViewOnPageSelectedEvent, PagerViewProps } from 'react-native-pager-view';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { useIsSharing } from '@/shared/model';

import { NoImage, Skeleton } from '../fallback';
import { LeftLineArrow, RightLineArrow } from '../icons/mini';
import { VideoPlayer } from '../media/video-player';
import { ImageViewer } from '../overlay/image-viewer';

export type CarouselVideoItem = {
  videoUrl: string;
  thumbnailUrl?: string;
};

export interface BasicCarouselProps extends PagerViewProps {
  data: string[];
  videoItem?: CarouselVideoItem | null;
  showIndicator?: boolean;
  showImageViewer?: boolean;
  imageRadius?: number;
}

const BasicCarousel = forwardRef<PagerView, BasicCarouselProps>(
  ({ data, videoItem, showIndicator = false, showImageViewer = false, imageRadius = 10, ...props }, ref) => {
    const [openImgViewer, setOpenImgViewer] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    // PagerView 가 native UIScrollView 라 RN root 의 pointerEvents 흡수를 우회 — onPress 자체에 직접 가드.
    const isSharing = useIsSharing();

    const handlePageSelected = useCallback((e: PagerViewOnPageSelectedEvent) => {
      setCurrentIndex(e.nativeEvent.position);
    }, []);

    const handleOpenViewer = useCallback(() => {
      if (isSharing) return;
      setOpenImgViewer(true);
    }, [isSharing]);

    const renderPage = (image: string) => (
      <CarouselImage uri={image} radius={imageRadius} onPress={showImageViewer ? handleOpenViewer : undefined} />
    );

    const hasVideo = !!videoItem;
    const totalPages = data.length + (hasVideo ? 1 : 0);
    const viewerIndex = hasVideo ? Math.max(0, currentIndex - 1) : currentIndex;

    const pages = [
      ...(videoItem
        ? [
            <View key="carousel-video">
              <VideoPlayer uri={videoItem.videoUrl} thumbnailUrl={videoItem.thumbnailUrl} radius={imageRadius} />
            </View>
          ]
        : []),
      ...data.map((image) => <View key={image}>{renderPage(image)}</View>)
    ];

    return (
      <>
        <PagerView
          style={styles.container}
          ref={ref}
          onPageSelected={handlePageSelected}
          initialPage={0}
          pageMargin={8}
          {...props}
        >
          {pages}
        </PagerView>
        {showIndicator && totalPages > 1 && <Indicator currentIndex={currentIndex} maxIndex={totalPages} />}
        <ImageViewer
          open={openImgViewer}
          onClose={() => setOpenImgViewer(false)}
          images={data}
          defaultIndex={viewerIndex}
        />
      </>
    );
  }
);

type CarouselImageProps = {
  uri: string;
  radius: number;
  onPress?: () => void;
};

const LOAD_TIMEOUT_MS = 5000;

// 한 번 실패한 URL 을 module 레벨에서 기억 — 같은 URL 이 cell remount 시 처음부터 hasError=true 로 시작해
// Skeleton → NoImage 전환 frame 자체를 없앤다 (인스타/카카오 등 일반 BP).
// 또한 한 번 성공한 URL 도 기억 — initial isLoaded=true 로 시작해 cache hit 시 깜빡임 없음.
const failedUrls = new Set<string>();
const loadedUrls = new Set<string>();

const CarouselImage = ({ uri, radius, onPress }: CarouselImageProps) => {
  const [hasError, setHasError] = useState(() => failedUrls.has(uri));
  const [isLoaded, setIsLoaded] = useState(() => loadedUrls.has(uri));
  const canPress = !!onPress && !hasError;

  // onError 가 안 오는 invalid URL 케이스 timeout fallback.
  useEffect(() => {
    if (isLoaded || hasError) return;
    const timer = setTimeout(() => {
      failedUrls.add(uri);
      setHasError(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isLoaded, hasError, uri]);

  const handleLoad = () => {
    loadedUrls.add(uri);
    setIsLoaded(true);
  };

  const handleError = () => {
    failedUrls.add(uri);
    setHasError(true);
  };

  // 3 layer 모두 항상 mount + opacity 만 0/1 전환 — conditional render(mount/unmount) 가 frame gap 의 원인.
  // Skeleton: 로딩 중 보임 / NoImage: 실패 시 보임 / Image: 성공 시 보임.
  const isLoading = !isLoaded && !hasError;
  const content = (
    <View style={styles.imageWrap}>
      <View style={[styles.image, { borderRadius: radius, opacity: isLoading ? 1 : 0 }]}>
        <Skeleton style={[styles.image, { borderRadius: radius }]} />
      </View>
      <View style={[styles.image, styles.overlay, { borderRadius: radius, opacity: hasError ? 1 : 0 }]}>
        <NoImage style={{ ...styles.image, borderRadius: radius }} />
      </View>
      <Image
        source={uri}
        cachePolicy="memory-disk"
        transition={150}
        contentFit="cover"
        onLoad={handleLoad}
        onError={handleError}
        style={[styles.image, styles.overlay, { borderRadius: radius, opacity: isLoaded ? 1 : 0 }]}
      />
    </View>
  );

  if (!canPress) return content;
  return (
    <Pressable onPress={onPress} style={styles.imageButton}>
      {content}
    </Pressable>
  );
};

type IndicatorProps = {
  currentIndex: number;
  maxIndex: number;
};
const Indicator = ({ currentIndex, maxIndex }: IndicatorProps) => (
  <IndicatorContainer>
    <IndicatorText>{`${currentIndex + 1}/${maxIndex}`}</IndicatorText>
  </IndicatorContainer>
);

export type CarouselControllerProps = {
  currentIndex: number;
  max: number;
  onPress: (type: 'prev' | 'next') => void;
};
const Controller = ({ currentIndex, max, onPress }: CarouselControllerProps) => {
  const { black900 } = useTheme();

  return (
    <ControllerContainer>
      <View onPress={() => onPress('prev')} hitSlop={10}>
        <LeftLineArrow width={11} height={11} color={black900.val} />
      </View>
      <ControllerText>{`${currentIndex + 1}/${max}`}</ControllerText>
      <View onPress={() => onPress('next')} hitSlop={10}>
        <RightLineArrow width={11} height={11} color={black900.val} />
      </View>
    </ControllerContainer>
  );
};

export const Carousel = Object.assign(BasicCarousel, { Controller });

const ControllerContainer = styled(XStack, {
  gap: 4,
  items: 'center',
  justify: 'space-between',
  rounded: 40,
  borderColor: '$black900',
  borderWidth: 0.5,
  borderStyle: 'solid',
  self: 'baseline',
  px: 10,
  py: 8,
  bg: 'rgba(255, 255, 255, 0.5)'
});

const ControllerText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '400',
  color: '$black900'
});

const IndicatorContainer = styled(View, {
  position: 'absolute',
  b: 12,
  r: 16,
  rounded: 20,
  px: 8,
  py: 4,
  bg: 'rgba(0, 0, 0, 0.5)'
});

const IndicatorText = styled(Text, {
  fontSize: 12,
  lineHeight: 14,
  fontWeight: '500',
  color: '$white900'
});

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%', height: '100%' },
  imageWrap: { width: '100%', height: '100%' },
  image: { borderRadius: 10, width: '100%', height: '100%' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  imageButton: { width: '100%', height: '100%' }
});

BasicCarousel.displayName = 'BasicCarousel';
