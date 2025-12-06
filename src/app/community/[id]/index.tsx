import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View, YStack } from 'tamagui';

import { CommunityAdoptCardStats } from '@/entities';
import { useCommunityAdoptDetailFeed } from '@/features';
import { Button, CallModal, useLayout, useLikePost, useSharePost } from '@/shared';
import {
  AdoptDetailInfoSection,
  CommentSection,
  CommunityDetailDescriptionSection,
  CommunityDetailOverviewSection
} from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [callModalOpen, setCallModalOpen] = useState(false);

  const { bottom } = useLayout();

  const { state, data, actions } = useCommunityAdoptDetailFeed(id);
  const { actions: likeActions } = useLikePost();
  const { actions: shareActions } = useSharePost();

  return (
    <KeyboardAwareScrollView bottomOffset={bottom}>
      <Container pb={bottom}>
        <View px={20} mb={32}>
          <CommunityDetailOverviewSection
            {...data.overviews}
            onPressLike={() => likeActions.toggleLike(id)}
            onPressShare={(id) =>
              shareActions.sharePost({ id, title: data.detailPost.title, image: data.detailPost.images[0] })
            }
          />
        </View>
        <Divider mb={32} />
        <YStack px={20} mb={40}>
          <AdoptDetailInfoSection {...data.infos} />
        </YStack>
        <View px={20} mb={32}>
          <CommunityDetailDescriptionSection {...data.descriptions} />
        </View>
        <View px={20} mb={20}>
          <Button onPress={() => setCallModalOpen((prev) => !prev)}>연락하기</Button>
        </View>
        <View px={20} mb={16}>
          <CommunityAdoptCardStats {...data.detailPost.counts} />
        </View>

        <CommentSection
          commentCount={data.detailPost.counts.comment}
          sortOrder={state.sortOrder}
          onChangeSortOrder={actions.changeSort}
        />
      </Container>

      <CallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        tel={''}
        name={''}
        title="님에게 문의하기"
        description={`*보호자에게 직접 문의해 정보를 확인할 수 있어요.`}
      />
    </KeyboardAwareScrollView>
  );
};

export default Page;

const Container = styled(YStack, {
  bg: '$pageBackground',
  position: 'relative',
  flex: 1,
  pt: 24
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});
