import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, Text, View, YStack } from 'tamagui';

import { CommentCard, CommentDto, CommentFormInput, CommentListHeader, CommunityAdoptCardStats } from '@/entities';
import { useCommunityAdoptDetailFeed, useCommunityCommentList } from '@/features';
import { Button, CallModal, ScrollUpButton, useLayout, useLikePost, useScrollUpButton } from '@/shared';
import { AdoptDetailInfoSection, CommunityDetailDescriptionSection, CommunityDetailOverviewSection } from '@/widgets';

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [inputHeight, setInputHeight] = useState(0);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { bottom } = useLayout();

  const { data } = useCommunityAdoptDetailFeed(id);
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  const { state: commentState, data: commentData, actions: commentActions } = useCommunityCommentList();
  const { actions: likeActions } = useLikePost();
  // const { actions: shareActions } = useSharePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CommentDto>) => {
      return (
        <View key={item.id} px={20} py={24}>
          <CommentCard comment={item} onPressLike={() => likeActions.toggleLikeComment(item.id)} />
        </View>
      );
    },
    [likeActions]
  );

  return (
    <Container>
      <FlashList
        data={commentData.commentList}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        onScroll={handleScroll}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View height={1} bg="$backgroundDefault" />}
        ListHeaderComponent={() => (
          <>
            <View px={20} mb={32}>
              <CommunityDetailOverviewSection
                {...data.overviews}
                onPressLike={() => likeActions.toggleLikePost(id)}
                onPressShare={(id) =>
                  // shareActions.sharePost({ id, title: data.detailPost.title, image: data.detailPost.images[0] })
                  console.log(123)
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
              <Button onPress={() => setCallModalOpen((prev) => !prev)}>문의하기</Button>
            </View>
            <View px={20} mb={16}>
              <CommunityAdoptCardStats {...data.detailPost.counts} />
            </View>

            <CommentListHeader
              commentCount={commentData.commentList.length}
              sortOrder={commentState.sortOrder}
              onChangeSortOrder={commentActions.changeSortOrder}
            />
          </>
        )}
        contentContainerStyle={{ paddingBottom: inputHeight, paddingTop: 32, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View items="center" justify="center" height={200}>
            <EmptyText>{'아직 댓글이 없습니다.\n여러분의 의견을 적어주세요:)'}</EmptyText>
          </View>
        )}
      />

      <KeyboardStickyView>
        <StickyInner onLayout={(event) => setInputHeight(event.nativeEvent.layout.height)} pb={bottom}>
          <CommentFormInput flex={1} maxH={48} />
          <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} bottom={inputHeight + 20} />
        </StickyInner>
      </KeyboardStickyView>

      <CallModal
        open={callModalOpen}
        onClose={() => setCallModalOpen(false)}
        tel={''}
        title={`${data.detailPost.user.nickname}님에게 문의하기`}
        description={`*보호자에게 직접 문의해 정보를 확인할 수 있어요.`}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const Divider = styled(View, {
  height: 8,
  bg: '$white850'
});

const EmptyText = styled(Text, {
  fontSize: 15,
  lineHeight: 23,
  color: '$black500',
  fontWeight: 500,
  text: 'center'
});

const StickyInner = styled(View, {
  position: 'relative',
  bg: '$pageBackground'
});
