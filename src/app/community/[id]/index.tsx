import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View, YStack } from 'tamagui';

import { CommunityAdoptCardStats } from '@/entities';
import { useCommunityAdoptDetailFeed } from '@/features';
import { Button, useLayout } from '@/shared';
import {
  CommentSection,
  CommunityDetailDescriptionSection,
  AdoptDetailInfoSection,
  CommunityDetailOverviewSection
} from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bottom } = useLayout();

  const { state, data, actions } = useCommunityAdoptDetailFeed();

  return (
    <KeyboardAwareScrollView bottomOffset={bottom}>
      <Container pb={bottom}>
        <View px={20} mb={32}>
          <CommunityDetailOverviewSection
            {...data.sections.overviewData}
            onPressLike={() => actions.toggleLike(id)}
            onPressShare={(id) => actions.sharePost({ id })}
          />
        </View>
        <Divider mb={32} />
        <YStack px={20} mb={40}>
          <AdoptDetailInfoSection {...data.sections.infoData} />
        </YStack>
        <View px={20} mb={32}>
          <CommunityDetailDescriptionSection {...data.sections.descriptionData} />
        </View>
        <View px={20} mb={20}>
          <Button onPress={actions.callToUser}>연락하기</Button>
        </View>
        <View px={20} mb={16}>
          <CommunityAdoptCardStats {...data.detailPost.counts} />
        </View>

        <CommentSection
          commentCount={data.detailPost.counts.comment}
          sortOrder={state.sortOrder}
          onChangeSortOrder={actions.toggleSortOrder}
        />
      </Container>
    </KeyboardAwareScrollView>
  );
};

export default Page;

const Container = styled(YStack, {
  bg: '$pageBackground',
  flex: 1,
  pt: 24
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
