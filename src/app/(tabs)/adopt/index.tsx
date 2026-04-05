import { ListRenderItemInfo } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { styled, View } from 'tamagui';

import { AdoptCard, AdoptItem } from '@/entities/adopt';
import { useAdoptFilter, useAdoptList } from '@/features/adopt';
import { useScrollUpButton } from '@/shared/model';
import { RouteErrorBoundary, ScrollUpButton, ShowMoreButton } from '@/shared/ui';
import { AdoptListHeaderSection, AdoptListSection } from '@/widgets/adopt-section';

export const ErrorBoundary = RouteErrorBoundary;

const LIST_SIZE = 16;

const Page = () => {
  const router = useRouter();
  const { selectedFilter, selectedType, changeFilter, changeType, changeSearch } = useAdoptFilter();
  const { convertedData, moreButtonText, isLoading, isFetchingNextPage, hasNextPage, refresh, fetchNextPage } =
    useAdoptList({ filter: selectedFilter, animalType: selectedType, size: LIST_SIZE });
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [scrollRef]);

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
            onChangeFilter={changeFilter}
            onChangeAnimalType={changeType}
            onSearch={changeSearch}
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
