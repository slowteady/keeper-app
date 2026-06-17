import { useScrollToTop } from '@react-navigation/native';
import { FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { View, YStack } from 'tamagui';

import { ADOPT_OPTIONS, AdoptCard, AdoptFilterDto, AdoptItem } from '@/entities/adopt';
import { ShelterFilterBar, useAdoptList, useShelterFilter } from '@/features/adopt';
import { useFavoriteAbandonment } from '@/features/favorite-abandonment';
import { ButtonGroup, ShowMoreButton } from '@/shared/ui';

import { AdoptListSection } from './adopt-list-section';

const LIST_SIZE = 16;

export const AdoptShelterScene = ({ scrollY }: { scrollY: SharedValue<number> }) => {
  const router = useRouter();
  const { animalType } = useLocalSearchParams<{ animalType?: string }>();

  const [selectedFilter, setSelectedFilter] = useState<AdoptFilterDto>(ADOPT_OPTIONS.FILTER[0].id);
  const [selectedType, setSelectedType] = useState<string>(animalType ?? ADOPT_OPTIONS.ANIMAL[0].id);

  const shelterFilter = useShelterFilter();
  const { applied, setBreed } = shelterFilter;

  useEffect(() => {
    if (animalType) setSelectedType(animalType);
  }, [animalType]);

  useEffect(() => {
    setBreed(undefined);
  }, [selectedType, setBreed]);

  const { convertedData, moreButtonText, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage } =
    useAdoptList({
      filter: selectedFilter,
      animalType: selectedType,
      region: applied.region,
      breed: applied.breed,
      gender: applied.gender,
      neuter: applied.neuter,
      ageBuckets: applied.age ? [applied.age] : undefined,
      size: LIST_SIZE
    });

  const scrollRef = useRef<FlashListRef<AdoptItem>>(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedType, selectedFilter, applied]);

  const goDetail = useCallback((id: string) => router.push({ pathname: '/adopt/[id]', params: { id } }), [router]);
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;
      return (
        <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32}>
          <AdoptCard
            uri={item.uri}
            imageCount={item.images?.length}
            title={item.title}
            description={item.description}
            chips={item.chips}
            isFavorited={item.isFavorited}
            status={item.status}
            onPress={() => goDetail(item.id)}
            onPressFavorite={() => toggleFavoriteAbandonment(item.id, item.isFavorited ?? false)}
          />
        </View>
      );
    },
    [goDetail, toggleFavoriteAbandonment]
  );

  const handleMore = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Medium);
    fetchNextPage();
  }, [fetchNextPage]);

  const handleScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = e.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  return (
    <AdoptListSection
      ref={scrollRef}
      data={convertedData}
      isLoading={isLoading}
      onRefreshCallback={refresh}
      onScroll={handleScroll}
      renderItem={renderItem}
      header={
        <YStack mb={16} gap={14}>
          <ButtonGroup data={ADOPT_OPTIONS.ANIMAL} id={selectedType} onChange={(id) => setSelectedType(id)} />
          <ShelterFilterBar
            filter={shelterFilter}
            animalType={selectedType}
            sortValue={selectedFilter}
            onChangeSort={setSelectedFilter}
          />
        </YStack>
      }
      footer={
        hasNextPage ? (
          <View mb={24} justify="center">
            <ShowMoreButton text={moreButtonText} onPress={handleMore} isLoading={isFetchingNextPage} />
          </View>
        ) : undefined
      }
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 24, paddingHorizontal: 20 }}
    />
  );
};
