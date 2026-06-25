import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { styled, View, XStack, YStack } from 'tamagui';

import { ADOPT_CARD_IMAGE_SIZES, AdoptCard, AdoptCardSkeleton, mapToAdoptList } from '@/entities/adopt';
import { CommunityPostListItem } from '@/entities/community';
import { ShelterCard, ShelterCardSkeleton, ShelterDto } from '@/entities/shelter';
import { useFavoriteAbandonment, useMyFavoriteAbandonments } from '@/features/favorite-abandonment';
import { useFavoriteShelter, useMyFavoriteShelters } from '@/features/favorite-shelter';
import { useLikePost, useMyLikedPosts } from '@/features/like-post';
import { useListRefreshing, useScrollToTop } from '@/shared/model';
import { ButtonGroup, FilterChip, ScrollToTopButton, useBottomSheetMenu } from '@/shared/ui';

import { ProfileCommentListSkeleton } from './profile-comment-list-skeleton';
import { ProfileEmptyState } from './profile-empty-state';

const TOP_TABS = [
  { id: 'adopt', label: '공고' },
  { id: 'shelter', label: '보호소' },
  { id: 'community', label: '커뮤니티' }
] as const;
type TopTab = (typeof TOP_TABS)[number]['id'];

const ADOPT_SUB = [
  { id: 'abandonment', label: '보호소 공고' },
  { id: 'personal', label: '개인 공고' }
] as const;
type AdoptSub = (typeof ADOPT_SUB)[number]['id'];

export const ProfileLikeScene = () => {
  const [tab, setTab] = useState<TopTab>('adopt');

  return (
    <Container>
      <ButtonGroupWrap>
        <ButtonGroup id={tab} data={TOP_TABS} onChange={setTab} />
      </ButtonGroupWrap>
      {tab === 'adopt' && <AdoptTab />}
      {tab === 'shelter' && <ShelterList />}
      {tab === 'community' && <CommunityTab />}
    </Container>
  );
};

const AdoptTab = () => {
  const [sub, setSub] = useState<AdoptSub>('abandonment');
  const { open } = useBottomSheetMenu({ data: ADOPT_SUB, value: sub, onPress: (d) => setSub(d.id) });
  const label = ADOPT_SUB.find((o) => o.id === sub)?.label ?? '';

  return (
    <>
      <FilterRow>
        <FilterChip label={label} active onPress={open} />
      </FilterRow>
      {sub === 'abandonment' ? <AbandonmentList /> : <PersonalList />}
    </>
  );
};

const CommunityTab = () => <CommunityPostLikeList />;

const AbandonmentList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyFavoriteAbandonments();
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { toggleFavoriteAbandonment } = useFavoriteAbandonment();
  const converted = useMemo(() => mapToAdoptList(items), [items]);
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<(typeof converted)[number]>();

  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<(typeof converted)[number]>) => {
      const isLeft = index % 2 === 0;
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
      <ProfileEmptyState
        text="관심있는 보호소 공고가 없어요"
        description="마음에 드는 보호소 공고에 하트를 누르면 여기에 모여요"
        cta={{ label: '보호소 공고 보기', onPress: () => router.navigate('/(tabs)/adopt') }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={converted}
        keyExtractor={(item) => item.id}
        numColumns={2}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? <AdoptLoading /> : null}
        ListFooterComponent={isFetchingNextPage ? <AdoptLoading count={2} /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const PersonalList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyLikedPosts();
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<(typeof items)[number]>();
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<(typeof items)[number]>) => (
      <CommunityPostListItem
        data={item}
        categoryLabel="개인공고"
        hideLikeCount
        onPress={(id) => router.push(`/(untabs)/community/${id}`)}
        onPressLike={(id, currentlyLiked) => toggleLikePost(id, currentlyLiked)}
      />
    ),
    [toggleLikePost]
  );

  if (!isLoading && items.length === 0) {
    return (
      <ProfileEmptyState
        text="관심있는 개인 공고가 없어요"
        description="마음에 드는 개인 공고에 하트를 누르면 여기에 모여요"
        cta={{
          label: '개인 공고 보기',
          onPress: () => router.navigate({ pathname: '/(tabs)/adopt', params: { source: 'personal' } })
        }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
        ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const ShelterList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyFavoriteShelters();
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<ShelterDto>();
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
      <ProfileEmptyState
        text="관심있는 보호소가 없어요"
        description="관심 가는 보호소에 하트를 누르면 여기에 모여요"
        cta={{ label: '보호소 둘러보기', onPress: () => router.navigate('/(tabs)/shelter') }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ItemSeparatorComponent={() => <View height={12} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          isLoading ? (
            <YStack gap={12}>
              {Array.from({ length: 4 }).map((_, idx) => (
                <ShelterCardSkeleton key={idx} />
              ))}
            </YStack>
          ) : null
        }
        ListFooterComponent={isFetchingNextPage ? <ShelterCardSkeleton /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const COMMUNITY_CATEGORY_LABEL: Record<'ADOPTION_LIFE' | 'QNA', string> = {
  ADOPTION_LIFE: '입양생활',
  QNA: '궁금해요'
};

const CommunityPostLikeList = () => {
  const { items, isLoading, isFetchingNextPage, fetchNextPage, refetch } = useMyLikedPosts('community');
  const { refreshing, handleRefresh } = useListRefreshing(async () => {
    await refetch();
  });
  const { ref, scrollY, onScroll, scrollToTop } = useScrollToTop<(typeof items)[number]>();
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<(typeof items)[number]>) => (
      <CommunityPostListItem
        data={item}
        categoryLabel={COMMUNITY_CATEGORY_LABEL[item.category === 'QNA' ? 'QNA' : 'ADOPTION_LIFE']}
        onPress={(id) => router.push(`/(untabs)/community/${id}`)}
        onPressLike={(id, currentlyLiked) => toggleLikePost(id, currentlyLiked)}
      />
    ),
    [toggleLikePost]
  );

  if (!isLoading && items.length === 0) {
    return (
      <ProfileEmptyState
        text="관심있는 게시글이 없어요"
        description="커뮤니티 글에 공감을 누르면 여기에 모여요"
        cta={{ label: '커뮤니티 둘러보기', onPress: () => router.navigate('/(tabs)/community') }}
      />
    );
  }

  return (
    <View flex={1}>
      <FlashList
        ref={ref}
        data={items}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 }}
        ListEmptyComponent={isLoading ? <ProfileCommentListSkeleton /> : null}
        ListFooterComponent={isFetchingNextPage ? <ProfileCommentListSkeleton count={1} /> : null}
      />
      <ScrollToTopButton scrollY={scrollY} onPress={scrollToTop} threshold={400} />
    </View>
  );
};

const AdoptLoading = ({ count = 4 }: { count?: number }) => (
  <AdoptSkeletonGrid>
    {Array.from({ length: count }).map((_, index) => (
      <View key={index} width={ADOPT_CARD_IMAGE_SIZES.small} mb={32}>
        <AdoptCardSkeleton width={ADOPT_CARD_IMAGE_SIZES.small} />
      </View>
    ))}
  </AdoptSkeletonGrid>
);

const Container = styled(YStack, {
  flex: 1
});

const ButtonGroupWrap = styled(View, {
  px: 20,
  pt: 16,
  pb: 8
});

const FilterRow = styled(XStack, {
  px: 20,
  pt: 4,
  pb: 8,
  justify: 'flex-start'
});

const AdoptSkeletonGrid = styled(View, {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justify: 'space-between'
});
