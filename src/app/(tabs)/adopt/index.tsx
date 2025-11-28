import { useCallback } from 'react';
import { styled, View } from 'tamagui';

import { useAdoptList } from '@/entities';
import { ShowMoreButton } from '@/shared';
import { AdoptListHeaderSection, AdoptListSection } from '@/widgets';

const LIST_SIZE = 16;

const Page = () => {
  const { refs, state, data, actions, flags } = useAdoptList({ size: LIST_SIZE });

  const fetchNextPage = useCallback(() => {
    actions.fetchNextPage();
  }, [actions]);

  const currentPage = (data.originalData?.page ?? 0) + 1;
  const totalPage = Math.ceil((data.originalData?.total || 0) / LIST_SIZE);
  const text = `더보기 ${currentPage}/${totalPage}`;

  return (
    <Container>
      <AdoptListSection
        ref={refs.listRef}
        data={data.convertedData}
        isLoading={flags.isLoading}
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
              <ShowMoreButton text={text} onPress={fetchNextPage} isLoading={flags.isFetchingNextPage} />
            </View>
          ) : undefined
        }
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
