import { useScrollToTop } from '@react-navigation/native';
import { FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { View } from 'tamagui';

import { ADOPT_OPTIONS, PersonalAdoptCard, PersonalAdoptItem } from '@/entities/adopt';
import { usePersonalAdoptList } from '@/features/adopt';
import { useLikePost } from '@/features/like-post';
import { ShowMoreButton } from '@/shared/ui';

import { AdoptListHeaderSection } from './adopt-list-header-section';
import { AdoptListSection } from './adopt-list-section';

const LIST_SIZE = 16;
const noop = () => {};

export const AdoptPersonalScene = ({ scrollY }: { scrollY: SharedValue<number> }) => {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string>(ADOPT_OPTIONS.ANIMAL[0].id);
  const [searchInput, setSearchInput] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const { convertedData, moreButtonText, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage } =
    usePersonalAdoptList({ animalType: selectedType, search: searchValue || undefined, size: LIST_SIZE });

  const scrollRef = useRef<FlashListRef<PersonalAdoptItem>>(null);
  useScrollToTop(scrollRef);

  const goDetail = useCallback(
    (id: string) => router.push({ pathname: '/(untabs)/adopt-personal/[id]', params: { id } }),
    [router]
  );
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PersonalAdoptItem>) => (
      <View mb={28}>
        <PersonalAdoptCard
          uri={item.uri}
          title={item.title}
          intro={item.intro}
          region={item.region}
          dateText={item.dateText}
          chips={item.chips}
          protectionType={item.protectionType}
          isLiked={item.isLiked}
          completed={item.completed}
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
        <AdoptListHeaderSection
          filterValue=""
          animalType={selectedType}
          searchValue={searchInput}
          onChangeFilter={noop}
          onChangeAnimalType={setSelectedType}
          onChangeSearch={setSearchInput}
          onSearch={setSearchValue}
          showFilter={false}
        />
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
