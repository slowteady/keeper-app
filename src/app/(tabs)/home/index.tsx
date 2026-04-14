import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { ADOPT_OPTIONS, AdoptFilterDto } from '@/entities/adopt';
import { useAdoptList } from '@/features/adopt';
import { useHomeShelter } from '@/features/shelter';
import { useListRefreshing, useScrollUpButton } from '@/shared/model';
import { RouteErrorBoundary, ScrollUpButton } from '@/shared/ui';
import { HomeAdoptSection, HomeBannerSection, HomeFooterSection, HomeShelterSection } from '@/widgets/home-section';

export const ErrorBoundary = RouteErrorBoundary;

const IMAGES = [require('@/assets/images/banner1.png'), require('@/assets/images/banner2.png')];

const SECTIONS = [{ id: 'banner' }, { id: 'adopt' }, { id: 'shelter' }] as const;

const Page = () => {
  const router = useRouter();
  const { isButtonVisible, handlePressButton, handleScroll, scrollRef } = useScrollUpButton();

  const [selectedFilter, setSelectedFilter] = useState<AdoptFilterDto>(ADOPT_OPTIONS.FILTER[0].id);
  const [selectedType, setSelectedType] = useState<string>(ADOPT_OPTIONS.ANIMAL[0].id);

  const { convertedData, isLoading, refresh } = useAdoptList({
    filter: selectedFilter,
    animalType: selectedType
  });

  const shelter = useHomeShelter();

  const goDetail = useCallback((id: string) => router.push({ pathname: '/adopt/[id]', params: { id } }), [router]);
  const goList = useCallback(() => router.push('/adopt'), [router]);

  const { refreshing, handleRefresh } = useListRefreshing(refresh);

  const renderItem = useCallback(
    ({ item }: { item: (typeof SECTIONS)[number] }) => {
      switch (item.id) {
        case 'banner':
          return (
            <View px={20} pt={24} pb={40}>
              <HomeBannerSection images={IMAGES} />
            </View>
          );
        case 'adopt':
          return (
            <View pb={40}>
              <HomeAdoptSection
                selectedFilter={selectedFilter}
                selectedType={selectedType}
                convertedData={convertedData}
                isLoading={isLoading}
                onGoDetail={goDetail}
                onGoList={goList}
                onChangeFilter={(id) => setSelectedFilter(id as AdoptFilterDto)}
                onChangeType={setSelectedType}
              />
            </View>
          );
        case 'shelter':
          return (
            <View pb={80}>
              <HomeShelterSection
                shelters={shelter.shelters}
                shelterCounts={shelter.shelterCounts}
                mapRef={shelter.mapRef}
                camera={shelter.camera}
                selectedMarkerId={shelter.selectedMarkerId}
                isGranted={shelter.isGranted}
                isLoading={shelter.isLoading}
                animatedListStyle={shelter.animatedListStyle}
                onMapInitialized={shelter.onMapInitialized}
                onRefetch={shelter.onRefetch}
                onTapMarker={shelter.onTapMarker}
              />
            </View>
          );
      }
    },
    [selectedFilter, selectedType, convertedData, isLoading, goDetail, goList, shelter]
  );

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        data={SECTIONS}
        onScroll={handleScroll}
        renderItem={renderItem}
        keyExtractor={({ id }) => id}
        getItemType={(item) => item.id}
        ListFooterComponent={<HomeFooterSection />}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1,
  bg: '$white900'
});
