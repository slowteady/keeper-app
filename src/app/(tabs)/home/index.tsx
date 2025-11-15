import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { styled, View } from 'tamagui';

import {
  ADOPT_NOTICES_QUERY_KEY,
  HomeAdoptSection,
  HomeBannerSection,
  HomeFooter,
  HomeShelterSection,
  HomeTemplate,
  SHELTER_QUERY_KEY
} from '@/shared';

/**
 * 메인 페이지
 */
const Page = () => {
  const queryClient = useQueryClient();

  const handleRequest = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [ADOPT_NOTICES_QUERY_KEY] }),
      queryClient.invalidateQueries({ queryKey: [SHELTER_QUERY_KEY] })
    ]);
  };

  const homeSections = useMemo(
    () => [
      { id: 'banner', Component: <HomeBannerSection /> },
      { id: 'adopt', Component: <HomeAdoptSection /> },
      { id: 'shelter', Component: <HomeShelterSection /> }
    ],
    []
  );

  return (
    <Container>
      <HomeTemplate
        data={homeSections}
        renderItem={({ item }) => <>{item.Component}</>}
        onRefresh={handleRequest}
        ListFooterComponent={<HomeFooter />}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  flex: 1
});
