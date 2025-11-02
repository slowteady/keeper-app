import { useMemo } from 'react';
import { ScrollView, styled, View } from 'tamagui';

import {
  CommunityDetailDescriptionSection,
  CommunityDetailInfoSection,
  CommunityDetailOverviewSection
} from '@/entities';

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
      <View px={20}>
        <CommunityDetailOverviewSection
          {...sections.overviewData}
          onPressLike={actions.toggleLike}
          onPressShare={(id) => actions.sharePost({ id })}
        />
      </View>
      <Divider mb={24} />
      <View px={20} mb={32}>
        <CommunityDetailInfoSection {...sections.infoData} />
      </View>
      <View px={20} mb={32}>
        <CommunityDetailDescriptionSection {...sections.descriptionData} />
      </View>
    </Container>
  );
};

const Container = styled(ScrollView, {
  flex: 1,
  py: 24
});
const Divider = styled(View, {
  height: 4,
  bg: '$white850'
});
