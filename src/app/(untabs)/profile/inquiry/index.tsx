import { useState } from 'react';
import { SceneMap } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { Tab } from '@/shared/ui';
import { InquiryFormScene, InquiryHistoryScene } from '@/widgets/profile';

const ROUTES = [
  { key: 'form', title: '문의하기' },
  { key: 'history', title: '문의내역' }
] as const;

const renderScene = SceneMap({
  form: InquiryFormScene,
  history: InquiryHistoryScene
});

const Page = () => {
  const [index, setIndex] = useState(0);

  return (
    <Container>
      <Tab navigationState={{ index, routes: [...ROUTES] }} renderScene={renderScene} onIndexChange={setIndex} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
