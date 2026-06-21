import { useScrollToTop } from '@react-navigation/native';
import { FlashList, FlashListRef } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { RelativePathString, useRouter } from 'expo-router';
import { useCallback, useRef } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { ADOPT_OPTIONS, adoptQueries } from '@/entities/adopt';
import { shelterQueries } from '@/entities/shelter';
import { useAdoptList, usePersonalAdoptList } from '@/features/adopt';
import { useHomeShelter } from '@/features/shelter';
import { SCREEN_GUTTER, SECTION_GAP } from '@/shared/lib';
import { useListRefreshing } from '@/shared/model';
import { RouteErrorBoundary } from '@/shared/ui';
import {
  HomeAdoptSection,
  HomeBannerSection,
  HomeFooterSection,
  HomePersonalSection,
  HomeShelterSection
} from '@/widgets/home-section';

export const ErrorBoundary = RouteErrorBoundary;

const IMAGES = [require('@/assets/images/banner1.png'), require('@/assets/images/banner2.png')];

const SECTIONS = [{ id: 'banner' }, { id: 'adopt' }, { id: 'personal' }, { id: 'shelter' }] as const;

const HOME_LIST_SIZE = 10;

const Page = () => {
  const router = useRouter();
  const scrollRef = useRef<FlashListRef<(typeof SECTIONS)[number]>>(null);
  useScrollToTop(scrollRef);

  const { convertedData, isLoading } = useAdoptList({
    filter: ADOPT_OPTIONS.FILTER[0].id,
    animalType: ADOPT_OPTIONS.ANIMAL[0].id,
    size: HOME_LIST_SIZE
  });

  const { convertedData: personalData, isLoading: personalLoading } = usePersonalAdoptList({
    animalType: ADOPT_OPTIONS.ANIMAL[0].id,
    sort: 'NEW',
    size: HOME_LIST_SIZE
  });

  const shelter = useHomeShelter();
  const queryClient = useQueryClient();

  const goDetail = useCallback((id: string) => router.push({ pathname: '/adopt/[id]', params: { id } }), [router]);
  const goList = useCallback(() => router.push('/adopt'), [router]);
  const goPersonalDetail = useCallback(
    (id: string) => router.push({ pathname: '/(untabs)/adopt-personal/[id]', params: { id } } as never),
    [router]
  );
  const goPersonalList = useCallback(() => router.push('/adopt?source=personal' as RelativePathString), [router]);

  const refreshCallback = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adoptQueries.all() }),
      queryClient.invalidateQueries({ queryKey: shelterQueries.all() })
    ]);
  }, [queryClient]);

  const { refreshing, handleRefresh } = useListRefreshing(refreshCallback);

  const renderItem = useCallback(
    ({ item }: { item: (typeof SECTIONS)[number] }) => {
      switch (item.id) {
        case 'banner':
          return (
            <View px={SCREEN_GUTTER} pt={24} pb={SECTION_GAP}>
              <HomeBannerSection images={IMAGES} />
            </View>
          );
        case 'adopt':
          return (
            <View pb={SECTION_GAP}>
              <HomeAdoptSection
                convertedData={convertedData}
                isLoading={isLoading}
                onGoDetail={goDetail}
                onGoList={goList}
              />
            </View>
          );
        case 'personal':
          return (
            <View pb={SECTION_GAP}>
              <HomePersonalSection
                convertedData={personalData}
                isLoading={personalLoading}
                onGoDetail={goPersonalDetail}
                onGoList={goPersonalList}
              />
            </View>
          );
        case 'shelter':
          return (
            <View pb={SECTION_GAP}>
              <HomeShelterSection
                shelters={shelter.shelters}
                isGranted={shelter.isGranted}
                isLoading={shelter.isLoading}
              />
            </View>
          );
      }
    },
    [
      convertedData,
      isLoading,
      personalData,
      personalLoading,
      goDetail,
      goList,
      goPersonalDetail,
      goPersonalList,
      shelter
    ]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        data={SECTIONS}
        renderItem={renderItem}
        keyExtractor={({ id }) => id}
        getItemType={(item) => item.id}
        ListFooterComponent={<HomeFooterSection />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$white900'
});
