import { useEffect } from 'react';
import { styled, View } from 'tamagui';

import { useAdoptList } from '@/entities';
import { ScrollUpButton, ShowMoreButton, useScrollUpButton } from '@/shared';
import { AdoptListHeaderSection, AdoptListSection } from '@/widgets';

const LIST_SIZE = 16;

const Page = () => {
  const { state, data, actions, flags } = useAdoptList({ size: LIST_SIZE });
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [scrollRef]);

  const currentPage = (data.originalData?.page ?? 0) + 1;
  const totalPage = Math.ceil((data.originalData?.total || 0) / LIST_SIZE);
  const text = `더보기 ${currentPage}/${totalPage}`;

  return (
    <Container>
      <AdoptListSection
        ref={scrollRef}
        data={data.convertedData}
        isLoading={flags.isLoading}
        onScroll={handleScroll}
        onRefreshCallback={actions.executeRefresh}
        onPressItem={actions.goDetail}
        header={
          <View mt={32}>
            <AdoptListHeaderSection
              filterValue={state.selectedFilter}
              animalType={state.selectedType}
              onChangeFilter={actions.changeFilter}
              onChangeAnimalType={actions.changeType}
              onSearch={actions.changeSearch}
            />
          </View>
        }
        footer={
          flags.hasNextPage ? (
            <View mb={24} justify="center">
              <ShowMoreButton text={text} onPress={actions.fetchNextPage} isLoading={flags.isFetchingNextPage} />
            </View>
          ) : undefined
        }
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
