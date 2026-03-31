import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { adoptQueries } from '@/entities/adopt';
import { shelterQueries } from '@/entities/shelter';
import { useAdoptList } from '@/features/adopt';
import { useShelterMap } from '@/features/shelter';
import { useListRefreshing, useScrollUpButton } from '@/shared/model';
import { ScrollUpButton } from '@/shared/ui';
import { HomeAdoptSection, HomeBannerSection, HomeFooterSection, HomeShelterSection } from '@/widgets/home-section';

const IMAGES = [require('@/assets/images/banner1.png'), require('@/assets/images/banner2.png')];

const Page = () => {
  const queryClient = useQueryClient();
  const { isButtonVisible, handlePressButton, handleScroll, scrollRef } = useScrollUpButton();

  const adopt = useAdoptList();
  const shelter = useShelterMap();

  const refetchQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: adoptQueries.all() }),
      queryClient.invalidateQueries({ queryKey: shelterQueries.all() })
    ]);
  };

  const { refreshing, handleRefresh } = useListRefreshing(refetchQueries);

  const sections = useMemo(() => {
    return [
      {
        id: 'banner',
        Component: (
          <View px={20} pt={24} pb={40}>
            <HomeBannerSection images={IMAGES} />
          </View>
        )
      },
      {
        id: 'adopt',
        Component: (
          <View pb={40}>
            <HomeAdoptSection
              selectedFilter={adopt.selectedFilter}
              selectedType={adopt.selectedType}
              convertedData={adopt.convertedData}
              isLoading={adopt.isLoading}
              onGoDetail={adopt.goDetail}
              onGoList={adopt.goList}
              onChangeFilter={adopt.changeFilter}
              onChangeType={adopt.changeType}
            />
          </View>
        )
      },
      {
        id: 'shelter',
        Component: (
          <View pb={80}>
            <HomeShelterSection
              shelters={shelter.shelters}
              shelterCounts={shelter.shelterCounts}
              mapRef={shelter.mapRef}
              camera={shelter.camera}
              selectedMarkerId={shelter.selectedMarkerId}
              hasLocationStatus={shelter.hasLocationStatus}
              isLoading={shelter.isLoading}
              animatedListStyle={shelter.animatedListStyle}
              onToggleMapEnabled={shelter.toggleMapEnabled}
              onRefetchShelterList={shelter.refetchShelterList}
              onToggleTapMarker={shelter.toggleTapMarker}
            />
          </View>
        )
      }
    ];
  }, [adopt, shelter]);

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        data={sections}
        onScroll={handleScroll}
        renderItem={({ item }) => item.Component}
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
