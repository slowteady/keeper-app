import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { SceneRendererProps } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { COMMUNITY_TAB_ROUTES } from '@/entities/community';
import { useLoginRequired } from '@/features/auth';
import { RouteErrorBoundary, Tab } from '@/shared/ui';
import { CommunityAdoptFeed, CommunityWriteFab } from '@/widgets/community-adopt-feed-section';
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
  const router = useRouter();
  const { requireLogin } = useLoginRequired();

  const navigationState = useMemo(() => ({ index, routes: COMMUNITY_TAB_ROUTES }), [index]);

  const handleIndexChange = useCallback((nextIndex: number) => {
    setIndex(nextIndex);
  }, []);

  const handlePressWrite = useCallback(async () => {
    await requireLogin(() => {
      const currentKey = COMMUNITY_TAB_ROUTES[index]?.key;
      router.push(currentKey === 'qna' ? '/community-qna-write' : '/community-write');
    });
  }, [requireLogin, router, index]);

  return (
    <Container>
      <Tab onIndexChange={handleIndexChange} navigationState={navigationState} renderScene={renderScene} />
      <CommunityWriteFab onPress={handlePressWrite} />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});
