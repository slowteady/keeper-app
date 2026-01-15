import { ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useEffect } from 'react';
import { styled, View } from 'tamagui';

import { AdoptCard, AdoptItem, useAdoptList } from '@/entities/adopt';
import { useScrollUpButton } from '@/shared/model';
import { ScrollUpButton, ShowMoreButton } from '@/shared/ui';
import { AdoptListHeaderSection, AdoptListSection } from '@/widgets/adopt-section';

const LIST_SIZE = 16;

const Page = () => {
  const { state, data, actions, flags } = useAdoptList({ size: LIST_SIZE });
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [scrollRef]);

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<AdoptItem>) => {
      const isLeft = index % 2 === 0;

      return (
        <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32} onPress={() => actions.goDetail(item.id)}>
          <AdoptCard uri={item.uri} title={item.title} description={item.description} chips={item.chips} />
        </View>
      );
    },
    [actions]
  );

  return (
    <Container>
      <AdoptListSection
        ref={scrollRef}
        data={data.convertedData ?? []}
        isLoading={flags.isLoading}
        onScroll={handleScroll}
        onRefreshCallback={actions.executeRefresh}
        renderItem={renderItem}
        header={
          <AdoptListHeaderSection
            filterValue={state.selectedFilter}
            animalType={state.selectedType}
            onChangeFilter={actions.changeFilter}
            onChangeAnimalType={actions.changeType}
            onSearch={actions.changeSearch}
          />
        }
        footer={
          flags.hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton
                text={data.moreButtonText}
                onPress={actions.fetchNextPage}
                isLoading={flags.isFetchingNextPage}
              />
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
