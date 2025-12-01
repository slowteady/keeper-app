import { FlashList } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback } from 'react';
import { RefreshControl } from 'react-native';
import { styled, View } from 'tamagui';

import { useShelter, useShelterAdoptList } from '@/entities';
import { SuspenseFallback, useRefreshing } from '@/shared';
import { ShelterDetailOverviewSection } from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id?: string }>();
  if (!id) return null;

  return (
    <Container>
      <Suspense fallback={<SuspenseFallback />}>
        <ShelterDetailContent id={id} />
      </Suspense>
    </Container>
  );

  // {
  //   /* <SheltersDetailTemplate
  //       shelterData={shelterData}
  //       adoptData={adoptData}
  //       isLoading={isLoading}
  //       onFetch={handleFetch}
  //       refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
  //     /> */
  // }
};

export default Page;

const ShelterDetailContent = ({ id }: { id: string }) => {
  const shelter = useShelter({ id });
  const shelterAdopts = useShelterAdoptList({ id });

  const onRefreshCallback = useCallback(async () => {
    await Promise.all([shelter.actions.executeRefresh(), shelterAdopts.actions.executeRefresh()]);
  }, []);

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  return (
    <FlashList
      data={[]}
      renderItem={() => <ShelterDetailOverviewSection />}
      keyExtractor={() => 'shelter-detail-overview-section'}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    />
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
