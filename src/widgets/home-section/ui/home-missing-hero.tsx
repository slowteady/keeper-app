import { useFocusEffect } from '@react-navigation/native';
import { ChevronRight, Siren } from '@tamagui/lucide-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet } from 'react-native';
import PagerView, { PageScrollStateChangedNativeEvent } from 'react-native-pager-view';
import { styled, Text, View, XStack } from 'tamagui';

import { MissingItem } from '@/entities/missing';
import { useFeaturedMissing } from '@/features/missing';
import { MISSING_RED } from '@/shared/lib';
import { useCarousel } from '@/shared/model';
import { NoImage, Skeleton } from '@/shared/ui';

import { HomeBannerSection } from './home-banner-section';

const AUTOPLAY_MS = 4000;
const LOAD_TIMEOUT_MS = 5000;
const failedUrls = new Set<string>();
const loadedUrls = new Set<string>();

export type HomeMissingHeroProps = {
  fallbackImages: string[];
};

export const HomeMissingHero = ({ fallbackImages }: HomeMissingHeroProps) => {
  const router = useRouter();
  const { items, isLoading, isError } = useFeaturedMissing();
  const featured = items;
  const { currentIndex, handlePageChange, carouselRef } = useCarousel(featured.length);

  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = currentIndex;
  }, [currentIndex]);

  const interactingRef = useRef(false);
  const handleScrollState = useCallback((e: PageScrollStateChangedNativeEvent) => {
    interactingRef.current = e.nativeEvent.pageScrollState !== 'idle';
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (featured.length <= 1) return;

      interactingRef.current = false;

      const id = setInterval(() => {
        if (interactingRef.current) return;
        requestAnimationFrame(() => {
          carouselRef.current?.setPage((activeRef.current + 1) % featured.length);
        });
      }, AUTOPLAY_MS);

      return () => clearInterval(id);
    }, [featured.length, carouselRef])
  );

  const goDetail = useCallback((id: string) => router.push({ pathname: '/missing/[id]', params: { id } }), [router]);
  const goList = useCallback(() => router.push('/missing'), [router]);

  if (isLoading) {
    return (
      <Container>
        <Skeleton style={StyleSheet.absoluteFill} />
      </Container>
    );
  }

  if (isError || !featured.length) {
    return <HomeBannerSection images={fallbackImages} />;
  }

  return (
    <Container>
      <PagerView
        ref={carouselRef}
        style={styles.fill}
        initialPage={0}
        onPageSelected={handlePageChange}
        onPageScrollStateChanged={handleScrollState}
      >
        {featured.map((item) => (
          <View key={item.id}>
            <Pressable style={styles.fill} onPress={() => goDetail(item.id)}>
              <HeroSlide item={item} />
            </Pressable>
          </View>
        ))}
      </PagerView>
      <TopBar>
        <TopBarLeft>
          <Siren size={16} color="white" />
          <BadgeText>실종·분실</BadgeText>
        </TopBarLeft>
        {featured.length > 1 && (
          <Counter onPress={goList} hitSlop={8}>
            <CounterText>{`${currentIndex + 1} / ${featured.length}`}</CounterText>
            <ChevronRight size={15} color="white" />
          </Counter>
        )}
      </TopBar>
    </Container>
  );
};

const HeroSlide = ({ item }: { item: MissingItem }) => {
  const meta = [item.kind, item.region].filter(Boolean).join(' · ');

  return (
    <View style={styles.fill}>
      <HeroImage uri={item.uri} />
      <LinearGradient colors={['transparent', 'rgba(38,38,38,0.85)']} style={styles.gradient} />
      <InfoWrap>
        <TitleText numberOfLines={2}>{meta}</TitleText>
        <SubText>{item.date}</SubText>
      </InfoWrap>
    </View>
  );
};

const HeroImage = ({ uri }: { uri: string }) => {
  const [hasError, setHasError] = useState(() => !uri || failedUrls.has(uri));
  const [isLoaded, setIsLoaded] = useState(() => loadedUrls.has(uri));

  useEffect(() => {
    if (!uri || isLoaded || hasError) return;
    const timer = setTimeout(() => {
      failedUrls.add(uri);
      setHasError(true);
    }, LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [uri, isLoaded, hasError]);

  const handleLoad = () => {
    loadedUrls.add(uri);
    setIsLoaded(true);
  };

  const handleError = () => {
    failedUrls.add(uri);
    setHasError(true);
  };

  const isLoading = !!uri && !isLoaded && !hasError;

  return (
    <View style={styles.image}>
      <View style={[styles.image, { opacity: isLoading ? 1 : 0 }]}>
        <Skeleton style={styles.image} />
      </View>
      <View style={[styles.image, { opacity: hasError ? 1 : 0 }]}>
        <NoImage style={styles.image} />
      </View>
      {!!uri && (
        <Image
          source={uri}
          cachePolicy="memory-disk"
          transition={150}
          contentFit="cover"
          onLoad={handleLoad}
          onError={handleError}
          style={[styles.image, { opacity: isLoaded ? 1 : 0 }]}
        />
      )}
    </View>
  );
};

const Container = styled(View, {
  width: Dimensions.get('screen').width - 40,
  aspectRatio: 4 / 5,
  position: 'relative',
  rounded: 10,
  overflow: 'hidden',
  bg: '$black900'
});

const TopBar = styled(XStack, {
  position: 'absolute',
  t: 0,
  l: 0,
  r: 0,
  items: 'center',
  justify: 'space-between',
  px: 16,
  py: 11,
  bg: MISSING_RED
});

const TopBarLeft = styled(XStack, {
  items: 'center',
  gap: 5
});

const BadgeText = styled(Text, {
  fontSize: 14,
  lineHeight: 16,
  fontWeight: '800',
  color: '$white900'
});

const Counter = styled(XStack, {
  items: 'center',
  gap: 1
});

const CounterText = styled(Text, {
  fontSize: 13,
  lineHeight: 16,
  fontWeight: '700',
  color: '$white900'
});

const InfoWrap = styled(View, {
  position: 'absolute',
  l: 16,
  r: 16,
  b: 24
});

const TitleText = styled(Text, {
  fontSize: 24,
  lineHeight: 30,
  fontWeight: '700',
  color: '$white900'
});

const SubText = styled(Text, {
  mt: 6,
  fontSize: 14,
  lineHeight: 18,
  fontWeight: '400',
  color: '$white700'
});

const styles = StyleSheet.create({
  fill: { width: '100%', height: '100%' },
  image: { ...StyleSheet.absoluteFillObject },
  gradient: { position: 'absolute', left: 0, right: 0, bottom: 0, height: '48%' }
});
