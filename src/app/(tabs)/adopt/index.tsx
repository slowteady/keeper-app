import { useScrollToTop } from '@react-navigation/native';
import { ListRenderItemInfo } from '@shopify/flash-list';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { styled, View } from 'tamagui';

import { ADOPT_OPTIONS, AdoptCard, AdoptFilterDto, AdoptItem } from '@/entities/adopt';
import { useAdoptList } from '@/features/adopt';
import { useScrollUpButton } from '@/shared/model';
import { RouteErrorBoundary, ScrollUpButton, ShowMoreButton } from '@/shared/ui';
import { AdoptListHeaderSection, AdoptListSection } from '@/widgets/adopt-section';

export const ErrorBoundary = RouteErrorBoundary;

const LIST_SIZE = 16;

const Page = () => {
  const router = useRouter();

  const [selectedFilter, setSelectedFilter] = useState<AdoptFilterDto>(ADOPT_OPTIONS.FILTER[0].id);
  const [selectedType, setSelectedType] = useState<string>(ADOPT_OPTIONS.ANIMAL[0].id);
  const [searchValue, setSearchValue] = useState('');

  const {
    convertedData,
    moreButtonText,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    refresh,
    fetchNextPage: fetchNextPageQuery
  } = useAdoptList({
    filter: selectedFilter,
    animalType: selectedType,
    search: searchValue || undefined,
    size: LIST_SIZE
  });

  const fetchNextPage = useCallback(() => {
    impactAsync(ImpactFeedbackStyle.Medium);
    fetchNextPageQuery();
  }, [fetchNextPageQuery]);

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  useScrollToTop(scrollRef);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [selectedFilter, selectedType, scrollRef]);

  const goDetail = useCallback((id: string) => router.push({ pathname: '/adopt/[id]', params: { id } }), [router]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;

      return (
        <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32} onPress={() => goDetail(item.id)}>
          <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
        </View>
      );
    },
    [goDetail]
  );

  return (
    <Container>
      <AdoptListSection
        ref={scrollRef}
        data={convertedData ?? []}
        isLoading={isLoading}
        onScroll={handleScroll}
        onRefreshCallback={refresh}
        renderItem={renderItem}
        header={
          <AdoptListHeaderSection
            filterValue={selectedFilter}
            animalType={selectedType}
            searchValue={searchValue}
            onChangeFilter={(id) => setSelectedFilter(id as AdoptFilterDto)}
            onChangeAnimalType={setSelectedType}
            onSearch={setSearchValue}
          />
        }
        footer={
          hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton text={moreButtonText} onPress={fetchNextPage} isLoading={isFetchingNextPage} />
            </View>
          ) : undefined
        }
        contentContainerStyle={{ paddingVertical: 32, paddingHorizontal: 20 }}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
