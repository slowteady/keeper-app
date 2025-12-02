import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { Suspense, useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { ADOPT_LIST_FILTER, AdoptCard, AdoptItem, useShelter, useShelterAdoptList } from '@/entities';
import { CallShelterModal } from '@/features';
import { Button, Dropdown, SuspenseFallback, useRefreshing } from '@/shared';
import { ShelterDetailDescriptionSection, ShelterDetailOverviewSection } from '@/widgets';

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
};

export default Page;

const LIST_SIZE = 16;

const ShelterDetailContent = ({ id }: { id: string }) => {
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { data: shelter, actions: shelterActions } = useShelter({ id });
  const { data: shelterAdopts, state, actions: shelterAdoptsActions } = useShelterAdoptList({ id });

  const onRefreshCallback = useCallback(async () => {
    await Promise.all([shelterActions.executeRefresh(), shelterAdoptsActions.executeRefresh()]);
  }, []);

  const { refreshing, handleRefresh } = useRefreshing(onRefreshCallback);

  const hasCallNumber = !!shelter?.tel;

  const renderItem = useCallback(({ item, index }: ListRenderItemInfo<AdoptItem>) => {
    const isLeft = index % 2 === 0;

    return (
      <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32} onPress={() => shelterAdoptsActions.goDetail(item.id)}>
        <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
      </View>
    );
  }, []);

  const currentPage = (shelterAdopts.originalData?.page ?? 0) + 1;
  const totalPage = Math.ceil((shelterAdopts.originalData?.total ?? 0) / LIST_SIZE);
  const text = `더보기 ${currentPage}/${totalPage}`;

  return (
    <FlashList
      data={shelterAdopts.convertedData ?? []}
      renderItem={renderItem}
      keyExtractor={({ id }, i) => `${id}-${i}`}
      decelerationRate="fast"
      showsVerticalScrollIndicator={false}
      numColumns={2}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      contentContainerStyle={{ paddingVertical: 32, paddingHorizontal: 20 }}
      ListHeaderComponent={
        <YStack mb={24}>
          <View mb={20}>
            <ShelterDetailOverviewSection data={shelter} />
          </View>
          <View mb={hasCallNumber ? 32 : 48}>
            <ShelterDetailDescriptionSection
              time={shelter.time}
              address={shelter.address}
              person={shelter.person}
              tel={shelter.tel ?? '정보 없음'}
            />
          </View>

          {hasCallNumber && (
            <View mb={48}>
              <Button size="large" onPress={() => setCallModalOpen((prev) => !prev)}>
                <Text fontSize={15} fontWeight={600} lineHeight={18} color="$black900">
                  보호소에 문의하기
                </Text>
              </Button>

              <CallShelterModal
                open={callModalOpen}
                onClose={() => setCallModalOpen(false)}
                tel={shelter.tel!}
                name={shelter.name}
              />
            </View>
          )}

          <XStack items="flex-end" justify="space-between">
            <XStack gap={6} items="flex-end">
              <Text fontSize={20} fontWeight="600" lineHeight={24} letterSpacing={-0.25} color="$black800">
                보호중인 아이들
              </Text>
              <Text fontSize={15} fontWeight="500" lineHeight={17} letterSpacing={-0.25} color="$black500">
                {shelterAdopts.convertedData.length}마리
              </Text>
            </XStack>

            <Dropdown
              data={[...ADOPT_LIST_FILTER]}
              value={state.selectedFilter}
              onChange={(value) => shelterAdoptsActions.changeFilter(value.id)}
              snapPoints={[200]}
            />
          </XStack>
        </YStack>
      }
    />
  );
};

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
