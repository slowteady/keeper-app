import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { styled, View, YStack } from 'tamagui';

import { AdoptCard, mapToAdoptList } from '@/entities/adopt';
import {
  CommentListItem,
  CommunityAdoptListDto,
  CommunityPostListItem,
  MyHelpfulCommentItemDto
} from '@/entities/community';
import { PROFILE_OPTIONS, ProfileLikeOption } from '@/entities/profile';
import { ShelterCard, ShelterDto } from '@/entities/shelter';
import { useCommentHelpful } from '@/features/community';
import { useFavoriteAbandonment, useMyFavoriteAbandonments } from '@/features/favorite-abandonment';
import { useFavoriteShelter, useMyFavoriteShelters } from '@/features/favorite-shelter';
import { useMyHelpfulComments } from '@/features/helpful-comment';
import { useLikePost, useMyLikedPosts } from '@/features/like-post';
import { ButtonGroup, FeedNodata } from '@/shared/ui';

export const ProfileLikeScene = () => {
  const [selected, setSelected] = useState<ProfileLikeOption>('adopt');

  return (
    <Container>
      <ButtonGroupWrap>
        <ButtonGroup id={selected} data={PROFILE_OPTIONS.LIKE} onChange={setSelected} />
      </ButtonGroupWrap>
      {selected === 'adopt' && <AdoptList />}
      {selected === 'shelter' && <ShelterList />}
      {selected === 'post' && <PostList />}
      {selected === 'comment' && <CommentList />}
    </Container>
  );
};

const AdoptList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyFavoriteAbandonments();
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();

  const converted = useMemo(() => mapToAdoptList(items), [items]);

  const renderItem = useCallback(
    ({ item, index: itemIndex }: ListRenderItemInfo<(typeof converted)[number]>) => {
      const isLeft = itemIndex % 2 === 0;
      return (
        <View pl={isLeft ? 0 : 4} pr={isLeft ? 4 : 0} mb={32}>
          <AdoptCard
            uri={item.uri}
            title={item.title}
            description={item.description}
            chips={item.chips}
            isFavorited={item.isFavorited}
            status={item.status}
            onPress={() => router.push(`/(untabs)/adopt/${item.id}`)}
            onPressFavorite={() => toggleFavoriteAbandonment(item.id, item.isFavorited ?? false)}
          />
        </View>
      );
    },
    [toggleFavoriteAbandonment]
  );

  if (!isLoading && converted.length === 0) {
    return (
      <EmptyWrap>
        <FeedNodata
          text="관심 있는 공고가 없어요"
          description="마음에 드는 친구를 찾아 하트를 눌러보세요"
          cta={{ label: '입양 공고 둘러보기', onPress: () => router.replace('/(tabs)/adopt') }}
        />
      </EmptyWrap>
    );
  }

  return (
    <FlashList
      data={converted}
      keyExtractor={(item) => item.id}
      numColumns={2}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListFooterComponent={isFetchingNextPage ? <View py={20} /> : null}
    />
  );
};

const ShelterList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyFavoriteShelters();
  const { toggleFavoriteShelter } = useFavoriteShelter();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => (
      <ShelterCard
        data={item}
        onPress={(id) => router.push(`/(untabs)/shelter/${id}`)}
        onPressFavorite={(careRegNo, isFavorited) => toggleFavoriteShelter(careRegNo, isFavorited)}
      />
    ),
    [toggleFavoriteShelter]
  );

  if (!isLoading && items.length === 0) {
    return (
      <EmptyWrap>
        <FeedNodata
          text="관심 보호소가 없어요"
          description="가까운 보호소를 찾아 하트를 눌러보세요"
          cta={{ label: '보호소 둘러보기', onPress: () => router.replace('/(tabs)/shelter') }}
        />
      </EmptyWrap>
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      ItemSeparatorComponent={() => <View height={12} />}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListFooterComponent={isFetchingNextPage ? <View py={20} /> : null}
    />
  );
};

const PostList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyLikedPosts();
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<CommunityAdoptListDto>) => (
      <CommunityPostListItem
        data={item}
        categoryLabel="개인입양"
        onPress={(id) => router.push(`/(untabs)/community/${id}`)}
        onPressLike={(id, currentlyLiked) => toggleLikePost(id, currentlyLiked)}
      />
    ),
    [toggleLikePost]
  );

  if (!isLoading && items.length === 0) {
    return (
      <EmptyWrap>
        <FeedNodata
          text="관심 게시글이 없어요"
          description="마음에 든 게시글에 하트를 눌러보세요"
          cta={{ label: '커뮤니티 둘러보기', onPress: () => router.replace('/(tabs)/community') }}
        />
      </EmptyWrap>
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListFooterComponent={isFetchingNextPage ? <View py={20} /> : null}
    />
  );
};

const CommentList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyHelpfulComments();
  const { toggleHelpful } = useCommentHelpful();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<MyHelpfulCommentItemDto>) => (
      <CommentListItem
        data={item}
        onPress={(postId) =>
          router.push({ pathname: '/(untabs)/community/[id]', params: { id: postId, scrollToComments: '1' } })
        }
        onPressHelpful={(c) =>
          toggleHelpful({ commentId: c.id, currentlyHelpful: c.isHelpful, currentCount: c.helpfulCount })
        }
      />
    ),
    [toggleHelpful]
  );

  if (!isLoading && items.length === 0) {
    return (
      <EmptyWrap>
        <FeedNodata
          text="관심 댓글이 없어요"
          description="마음에 든 댓글에 하트를 눌러보세요"
          cta={{ label: '커뮤니티 둘러보기', onPress: () => router.replace('/(tabs)/community') }}
        />
      </EmptyWrap>
    );
  }

  return (
    <FlashList
      data={items}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={0.5}
      onRefresh={refetch}
      refreshing={false}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
      ListFooterComponent={isFetchingNextPage ? <View py={20} /> : null}
    />
  );
};

const Container = styled(YStack, {
  flex: 1
});

const ButtonGroupWrap = styled(View, {
  px: 20,
  pt: 16,
  pb: 12
});

const EmptyWrap = styled(View, {
  flex: 1,
  items: 'center',
  justify: 'center',
  py: 60
});
