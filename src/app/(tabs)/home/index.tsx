import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { styled, useTheme, View } from 'tamagui';

import {
  ADOPT_NOTICES_QUERY_KEY,
  Header,
  HomeAdoptSection,
  HomeBannerSection,
  HomeFooter,
  HomeShelterSection,
  HomeTemplate,
  SHELTER_QUERY_KEY
} from '@/shared';
import { Logo } from '@/shared/ui/icons/outline';

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
      <Header left={<HeaderLeft />} />

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

const HeaderLeft = () => {
  const { black900 } = useTheme();

  return <Logo width={96} height={30} color={black900.val} />;
};

const Container = styled(View, {
  flex: 1
});
