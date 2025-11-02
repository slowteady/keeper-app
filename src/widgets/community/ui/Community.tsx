import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';

import { Tab } from '@/shared';

import { CommunityAdoptFeed } from '../community-adopt-feed';
import { CommunityLifeFeed } from '../community-life-feed';
import { CommunityQnAFeed } from '../community-qna-feed';
import { COMMUNITY_ROUTES } from '../model';

const renderScene = SceneMap({
  adopt: CommunityAdoptFeed,
  life: CommunityLifeFeed,
  qna: CommunityQnAFeed
});

export const Community = () => {
  const [index, setIndex] = useState(0);

  return (
    <Tab onIndexChange={setIndex} navigationState={{ index, routes: COMMUNITY_ROUTES }} renderScene={renderScene} />
  );
};
