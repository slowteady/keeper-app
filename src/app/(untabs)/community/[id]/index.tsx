import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, Text, View, YStack } from 'tamagui';

import { CommentCard, CommentDto, CommentFormInput, CommentListHeader } from '@/entities/comment';
import { CommunityAdoptCardStats } from '@/entities/community';
import { useCommunityAdoptDetailFeed, useCommunityCommentList } from '@/features/community';
import { useLikePost } from '@/features/like-post';
import { useLayout, useScrollUpButton, useShare } from '@/shared/model';
import { Button, CallModal, DetailErrorBoundary, ScrollUpButton } from '@/shared/ui';
import { AdoptDetailInfoSection } from '@/widgets/adopt-section';
import {
  CommunityDetailDescriptionSection,
  CommunityDetailOverviewSection
} from '@/widgets/community-adopt-feed-section';

export const ErrorBoundary = DetailErrorBoundary;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [inputHeight, setInputHeight] = useState(0);
  const [callModalOpen, setCallModalOpen] = useState(false);

  const { bottom } = useLayout();

  const numId = Number(id);
  const { data } = useCommunityAdoptDetailFeed(id);
  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();
  const { sortOrder, commentList, changeSortOrder } = useCommunityCommentList(numId);
  const { toggleLikePost } = useLikePost();
  const { share } = useShare();

  const renderItem = useCallback(({ item }: ListRenderItemInfo<CommentDto>) => {
    return (
      <View key={item.id} px={20} py={24}>
        <CommentCard comment={item} />
      </View>
    );
  }, []);

  const detailPost = data.detailPost;
  const isLiked = detailPost?.isLiked ?? false;

  return (
    <Container>
      <FlashList
        data={commentList}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        renderItem={renderItem}
        onScroll={handleScroll}
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        decelerationRate="fast"
        ItemSeparatorComponent={() => <View height={1} bg="$backgroundDefault" />}
        ListHeaderComponent={() => (
          <>
            {detailPost && (
              <View px={20} mb={32}>
                <CommunityDetailOverviewSection
                  {...(data.overviews as Parameters<typeof CommunityDetailOverviewSection>[0])}
                  onPressLike={() => toggleLikePost(numId, isLiked)}
                  onPressShare={(shareId: number) =>
                    share({
                      id: String(shareId),
                      path: 'community',
                      title: detailPost.title,
                      desc: '유기동물들의 가족이 되어주세요',
                      image: detailPost.images[0]
                    })
                  }
                />
              </View>
            )}

            <Divider mb={32} />

            {detailPost && (
              <>
                <YStack px={20} mb={40}>
                  <AdoptDetailInfoSection {...(data.infos as Parameters<typeof AdoptDetailInfoSection>[0])} />
                </YStack>
                <View px={20} mb={32}>
                  <CommunityDetailDescriptionSection
                    {...(data.descriptions as Parameters<typeof CommunityDetailDescriptionSection>[0])}
                  />
                </View>
                <View px={20} mb={20}>
                  <Button onPress={() => setCallModalOpen((prev) => !prev)}>문의하기</Button>
                </View>
                <View px={20} mb={16}>
                  <CommunityAdoptCardStats {...detailPost.counts} />
                </View>
              </>
            )}

            <CommentListHeader
              commentCount={commentList.length}
              sortOrder={sortOrder}
              onChangeSortOrder={changeSortOrder}
            />
          </>
        )}
        contentContainerStyle={{ paddingBottom: inputHeight, paddingTop: 32, flexGrow: 1 }}
        ListEmptyComponent={() => (
          <View items="center" justify="center" height={200}>
            <EmptyText>{'아직 댓글이 없습니다\n여러분의 의견을 적어주세요:)'}</EmptyText>
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
        title={`${detailPost?.user?.nickname ?? '탈퇴한 사용자'}님에게 문의하기`}
        description={`*보호자에게 직접 문의해 정보를 확인할 수 있어요`}
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
