import { useMemo } from 'react';
import { ScrollView, styled, View, YStack } from 'tamagui';

import {
  CommunityDetailDescriptionSection,
  CommunityDetailInfoSection,
  CommunityDetailOverviewSection
} from '@/entities';
import { Button } from '@/shared';

import { getSectionData } from '../lib';
import { useCommunityAdoptDetailFeed } from '../model';

export interface CommunityAdoptDetailFeedProps {
  vm: ReturnType<typeof useCommunityAdoptDetailFeed>;
}

export const CommunityAdoptDetailFeed = ({ vm }: CommunityAdoptDetailFeedProps) => {
  const { data, actions } = vm;
  const sections = useMemo(() => getSectionData(data.detailPost), [data.detailPost]);

  return (
    <Container>
      <View px={20} mb={32}>
        <CommunityDetailOverviewSection
          {...sections.overviewData}
          onPressLike={actions.toggleLike}
          onPressShare={(id) => actions.sharePost({ id })}
        />
      </View>
      <Divider mb={32} />
      <YStack px={20} mb={40}>
        <CommunityDetailInfoSection {...sections.infoData} />
      </YStack>
      <View px={20} mb={32}>
        <CommunityDetailDescriptionSection {...sections.descriptionData} />
      </View>
      <View px={20} mb={32}>
        <Button onPress={actions.callToUser}>연락하기</Button>
      </View>
    </Container>
  );
};

const Container = styled(ScrollView, {
  flex: 1,
  py: 24
});
const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
