import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';

import { CommunityAdoptList, CommunityLifeList, CommunityQnAList } from '@/features';
import { Tab } from '@/shared';

import { COMMUNITY_ROUTES } from '../model';

const renderScene = SceneMap({
  adopt: CommunityAdoptList,
  life: CommunityLifeList,
  qna: CommunityQnAList
});

export const Community = () => {
  const [index, setIndex] = useState(0);

  return (
    <Tab onIndexChange={setIndex} navigationState={{ index, routes: COMMUNITY_ROUTES }} renderScene={renderScene} />
  );
};
