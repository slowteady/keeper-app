import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { COMMUNITY_TAB_ROUTES } from '@/entities/community';
import { Tab } from '@/shared/ui';
import { CommunityAdoptFeed } from '@/widgets/community-adopt-feed-section';
import { CommunityLifeFeed } from '@/widgets/community-life-feed-section';
import { CommunityQnAFeed } from '@/widgets/community-qna-feed-section';

const renderScene = SceneMap({
  adopt: CommunityAdoptFeed,
  life: CommunityLifeFeed,
  qna: CommunityQnAFeed
});

const Page = () => {
  const [index, setIndex] = useState(0);

  return (
    <Container>
      <Tab
        onIndexChange={setIndex}
        navigationState={{ index, routes: COMMUNITY_TAB_ROUTES }}
        renderScene={renderScene}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
