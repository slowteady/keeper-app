import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';

import { CommunityAdoptTemplate, CommunityLifeTemplate, CommunityQnATemplate } from '@/domains/community';
import { Tab } from '@/shared/components/molecules/Tab';

/**
 * 커뮤니티 목록 페이지
 */
const ROUTES = [
  { key: 'adopt', title: '개인입양' },
  { key: 'life', title: '입양생활' },
  { key: 'qna', title: '질문' }
];

const renderScene = SceneMap({
  adopt: CommunityAdoptTemplate,
  life: CommunityLifeTemplate,
  qna: CommunityQnATemplate
});

const Page = () => {
  const [index, setIndex] = useState(0);
  console.log('🔥 / Page / index:', index);

  return <Tab onIndexChange={setIndex} navigationState={{ index, routes: ROUTES }} renderScene={renderScene} />;
};

export default Page;
