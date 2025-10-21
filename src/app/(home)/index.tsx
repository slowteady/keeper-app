import { DrawerActions } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { useNavigation } from 'expo-router';
import { useMemo } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import {
  ADOPT_NOTICES_QUERY_KEY,
  Header,
  HomeAdoptSection,
  HomeBannerSection,
  HomeFooter,
  HomeShelterSection,
  HomeTemplate,
  SHELTER_QUERY_KEY,
  useLayout
} from '@/shared';
import { Logo, Menu } from '@/shared/ui/icons/outline';

/**
 * 메인 페이지
 */
const Page = () => {
  const { top } = useLayout();
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
    <>
      <Header left={<HeaderLeft />} right={<HeaderRight />} ContainerProps={{ pt: top }} />

      <HomeTemplate
        data={homeSections}
        renderItem={({ item }) => <>{item.Component}</>}
        onRefresh={handleRequest}
        ListFooterComponent={<HomeFooter />}
      />
    </>
  );
};

export default Page;

const HeaderLeft = () => {
  const { black900 } = useTheme();

  return <Logo width={96} height={30} color={black900.val} />;
};

const HeaderRight = () => {
  const navigation = useNavigation();
  const { black900 } = useTheme();

  const handlePressDrawer = async () => {
    await impactAsync(ImpactFeedbackStyle.Medium);
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <Pressable onPress={handlePressDrawer}>
      <Menu width={24} height={24} color={black900.val} />
    </Pressable>
  );
};
