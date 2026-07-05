import { useScrollToTop } from '@react-navigation/native';
import { FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { View, YStack } from 'tamagui';

import { ADOPT_OPTIONS, PersonalAdoptCard, PersonalAdoptItem, PersonalSort } from '@/entities/adopt';
import { PersonalFilterBar, usePersonalAdoptList, usePersonalFilter } from '@/features/adopt';
import { useLikePost } from '@/features/like-post';
import { ButtonGroup, ShowMoreButton } from '@/shared/ui';

import { AdoptListSection } from './adopt-list-section';

const LIST_SIZE = 16;

export const AdoptPersonalScene = ({ scrollY }: { scrollY: SharedValue<number> }) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>(ADOPT_OPTIONS.ANIMAL[0].id);
  const [sortValue, setSortValue] = useState<PersonalSort>('NEW');

  const personalFilter = usePersonalFilter();
  const { applied, setBreed } = personalFilter;

  useEffect(() => {
    setBreed(undefined);
  }, [selectedType, setBreed]);

  const { convertedData, moreButtonText, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage } =
    usePersonalAdoptList({
      animalType: selectedType,
      region: applied.region,
      breed: applied.breed,
      gender: applied.gender,
      neuter: applied.neuter,
      age: applied.age,
      protectionType: applied.protectionType,
      adoptionStatus: applied.adoptionStatus,
      vaccination: applied.vaccination,
      healthCheck: applied.healthCheck,
      sort: sortValue,
      size: LIST_SIZE
    });

  const scrollRef = useRef<FlashListRef<PersonalAdoptItem>>(null);
  useScrollToTop(scrollRef);

  useEffect(() => {
    scrollRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [selectedType, sortValue, applied]);

  const goDetail = useCallback(
    (id: string) => router.push({ pathname: '/(untabs)/adopt-personal/[id]', params: { id } }),
    [router]
  );
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PersonalAdoptItem>) => (
      <View mb={32}>
        <PersonalAdoptCard
          uri={item.uri}
          imageCount={item.imageCount}
          title={item.title}
          intro={item.intro}
          breed={item.breed}
          region={item.region}
          dateText={item.dateText}
          chips={item.chips}
          protectionType={item.protectionType}
          isLiked={item.isLiked}
          completed={item.completed}
          hasVideo={item.hasVideo}
          videoDuration={item.videoDuration}
          onPress={() => goDetail(item.id)}
          onPressFavorite={() => toggleLikePost(item.id, item.isLiked)}
        />
      </View>
    ),
    [goDetail, toggleLikePost]
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
      numColumns={1}
      isLoading={isLoading}
      onRefreshCallback={refresh}
      onScroll={handleScroll}
      renderItem={renderItem}
      header={
        <YStack mb={16} gap={14}>
          <ButtonGroup
            data={ADOPT_OPTIONS.ANIMAL}
            id={selectedType}
            onChange={(id) => {
              if (id === selectedType) return;
              setSelectedType(id);
              personalFilter.reset();
            }}
          />
          <PersonalFilterBar
            filter={personalFilter}
            animalType={selectedType}
            sortValue={sortValue}
            onChangeSort={setSortValue}
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
