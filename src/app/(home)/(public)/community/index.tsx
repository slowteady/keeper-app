import { createStore, Provider } from 'jotai';
import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';

import { CommunityAdoptTemplate } from '@/domains/community/components/templates/CommunityAdoptTemplate';
import { CommunityLifeTemplate } from '@/domains/community/components/templates/CommunityLifeTemplate';
import { CommunityQnATemplate } from '@/domains/community/components/templates/CommunityQnATemplate';
import { Tab } from '@/shared/components/molecules/Tab';

/**
 * 커뮤니티 목록 페이지
 */
const ROUTES = [
  { key: 'first', title: '개인입양' },
  { key: 'second', title: '입양생활' },
  { key: 'third', title: '질문' }
];

const renderScene = SceneMap({
  first: CommunityAdoptTemplate,
  second: CommunityLifeTemplate,
  third: CommunityQnATemplate
});

const Page = () => {
  const [index, setIndex] = useState(0);
  const store = createStore();

  return (
    <Provider store={store}>
      <Tab onIndexChange={setIndex} navigationState={{ index, routes: ROUTES }} renderScene={renderScene} />
    </Provider>
  );
};

export default Page;
