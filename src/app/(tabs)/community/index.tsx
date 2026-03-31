import { useCallback, useState } from 'react';
import { SceneRendererProps } from 'react-native-tab-view';
import { styled, View } from 'tamagui';

import { COMMUNITY_TAB_ROUTES } from '@/entities/community';
import { useCommunityAdoptFeed, useCommunityListFilter } from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { Tab } from '@/shared/ui';
import { CommunityAdoptFeed } from '@/widgets/community-adopt-feed-section';
import { CommunityLifeFeed } from '@/widgets/community-life-feed-section';
import { CommunityQnAFeed } from '@/widgets/community-qna-feed-section';

const Page = () => {
  const [index, setIndex] = useState(0);

  const { toggleLikePost } = useLikePost();
  const { selectedFilter, selectedAnimalType, changeFilter, changeAnimalType } = useCommunityListFilter();
  const { adoptList, goDetailPage } = useCommunityAdoptFeed();

  const renderScene = useCallback(
    ({ route }: SceneRendererProps & { route: { key: string } }) => {
      switch (route.key) {
        case 'adopt':
          return (
            <CommunityAdoptFeed
              adoptList={adoptList}
              selectedFilter={selectedFilter}
              selectedAnimalType={selectedAnimalType}
              onChangeFilter={changeFilter}
              onChangeAnimalType={changeAnimalType}
              onGoDetailPage={goDetailPage}
              onToggleLikePost={toggleLikePost}
            />
          );
        case 'life':
          return <CommunityLifeFeed />;
        case 'qna':
          return <CommunityQnAFeed />;
        default:
          return null;
      }
    },
    [adoptList, selectedFilter, selectedAnimalType, changeFilter, changeAnimalType, goDetailPage, toggleLikePost]
  );

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
