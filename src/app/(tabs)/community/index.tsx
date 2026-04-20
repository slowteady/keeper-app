import { useCallback, useMemo, useState } from 'react';
import { SceneRendererProps } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { COMMUNITY_TAB_ROUTES } from '@/entities/community';
import { RouteErrorBoundary, Tab } from '@/shared/ui';
import { CommunityAdoptFeed } from '@/widgets/community-adopt-feed-section';
import { CommunityLifeFeed } from '@/widgets/community-life-feed-section';
import { CommunityQnAFeed } from '@/widgets/community-qna-feed-section';

export const ErrorBoundary = RouteErrorBoundary;

const renderScene = ({ route }: SceneRendererProps & { route: { key: string } }) => {
  switch (route.key) {
    case 'adopt':
      return <CommunityAdoptFeed />;
    case 'life':
      return <CommunityLifeFeed />;
    case 'qna':
      return <CommunityQnAFeed />;
    default:
      return null;
  }
};

const Page = () => {
  const [index, setIndex] = useState(0);

  const navigationState = useMemo(() => ({ index, routes: COMMUNITY_TAB_ROUTES }), [index]);

  const handleIndexChange = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
  }, []);

  return (
    <Container>
      <Tab onIndexChange={handleIndexChange} navigationState={navigationState} renderScene={renderScene} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
