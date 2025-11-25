import { ScrollUpButton, useScrollUpButton } from '@/entities';
import { ADOPTS_QUERY_KEY, SHELTER_QUERY_KEY, useRefreshing } from '@/shared';
import { HomeAdoptSection, HomeBannerSection, HomeFooterSection, HomeShelterSection } from '@/widgets';
import { FlashList } from '@shopify/flash-list';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

const IMAGES = [require('@/assets/images/banner1.png'), require('@/assets/images/banner2.png')];

const Page = () => {
  const queryClient = useQueryClient();
  const { isButtonVisible, handlePressButton, handleScroll, scrollRef } = useScrollUpButton();

  const refetchQueries = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ADOPTS_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] })
    ]);
  };

  const { refreshing, handleRefresh } = useRefreshing(refetchQueries);

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
            <HomeAdoptSection />
          </View>
        )
      },
      {
        id: 'shelter',
        Component: (
          <View pb={80}>
            <HomeShelterSection />
          </View>
        )
      }
    ];
  }, []);

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
