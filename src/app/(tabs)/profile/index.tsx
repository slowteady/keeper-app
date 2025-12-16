import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { PROFILE_TAB_ROUTES } from '@/entities/profile';
import { useAuthUser } from '@/features';
import { Tab } from '@/shared';
import {
  ProfileActivityScene,
  ProfileLikeScene,
  ProfileNoticeScene,
  ProfileShareSection,
  ProfileUserSection
} from '@/widgets';

const renderScene = SceneMap({
  like: ProfileLikeScene,
  activity: ProfileActivityScene,
  notice: ProfileNoticeScene
});

const Page = () => {
  const [index, setIndex] = useState(0);

  const { data, flags } = useAuthUser();

  return (
    <Container>
      <View px={20} mb={24} pt={40}>
        <ProfileUserSection isLoggedIn={flags.isLoggedIn} user={data.user} />
      </View>

      <View px={20} mb={16}>
        <ProfileShareSection />
      </View>

      <Tab onIndexChange={setIndex} navigationState={{ index, routes: PROFILE_TAB_ROUTES }} renderScene={renderScene} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
