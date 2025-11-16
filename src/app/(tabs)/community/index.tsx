import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { COMMUNITY_ROUTES } from '@/entities';
import { Tab } from '@/shared';
import { CommunityAdoptFeed, CommunityLifeFeed, CommunityQnAFeed } from '@/widgets';

const renderScene = SceneMap({
  adopt: CommunityAdoptFeed,
  life: CommunityLifeFeed,
  qna: CommunityQnAFeed
});

const Page = () => {
  const [index, setIndex] = useState(0);

  return (
    <Container>
      <Tab onIndexChange={setIndex} navigationState={{ index, routes: COMMUNITY_ROUTES }} renderScene={renderScene} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
