import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { Tab } from '@/shared';
import { AdoptTab, LifeTab, QnATab } from '@/widgets';

const ROUTES = [
  { key: 'adopt', title: '개인입양' },
  { key: 'life', title: '입양생활' },
  { key: 'qna', title: '질문' }
];

const renderScene = SceneMap({
  adopt: AdoptTab,
  life: LifeTab,
  qna: QnATab
});

const Page = () => {
  const [index, setIndex] = useState(0);

  return (
    <Container>
      <Tab onIndexChange={setIndex} navigationState={{ index, routes: ROUTES }} renderScene={renderScene} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
