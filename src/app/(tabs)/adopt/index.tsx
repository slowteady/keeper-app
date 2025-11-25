import { useCallback } from 'react';
import { styled, View } from 'tamagui';

import { useAdoptList } from '@/features';
import { ShowMoreButton } from '@/shared';
import { AdoptList } from '@/widgets';

const LIST_SIZE = 16;

const Page = () => {
  const { refs, state, data, actions, flags } = useAdoptList({ size: LIST_SIZE });

  const fetchNextPage = useCallback(() => {
    actions.fetchNextPage();
  }, []);

  const currentPage = (data.originalData?.page ?? 0) + 1;
  const totalPage = Math.ceil((data.originalData?.total || 0) / LIST_SIZE);
  const text = `더보기 ${currentPage}/${totalPage}`;

  return (
    <Container>
      <AdoptList
        data={data.convertedData}
        isLoading={flags.isLoading}
        onRefreshCallback={actions.executeRefresh}
        footer={<ShowMoreButton text={text} onPress={fetchNextPage} isLoading={flags.isFetchingNextPage} />}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
