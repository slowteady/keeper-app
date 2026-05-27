import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { SceneRendererProps } from 'react-native-tab-view';
import { styled, View, YStack } from 'tamagui';

import { AdoptCard, mapToAdoptList } from '@/entities/adopt';
import { PROFILE_LIKE_TAB_ROUTES } from '@/entities/profile';
import { ShelterCard, ShelterDto } from '@/entities/shelter';
import { useFavoriteAbandonment, useMyFavoriteAbandonments } from '@/features/favorite-abandonment';
import { useFavoriteShelter, useMyFavoriteShelters } from '@/features/favorite-shelter';
import { FeedNodata, Tab } from '@/shared/ui';

type RouteKey = (typeof PROFILE_LIKE_TAB_ROUTES)[number]['key'];

const renderScene = ({ route }: SceneRendererProps & { route: { key: RouteKey } }) => {
  switch (route.key) {
    case 'adopt':
      return <AdoptList />;
    case 'shelter':
      return <ShelterList />;
    default:
      return null;
  }
};

export const ProfileLikeScene = () => {
  const [index, setIndex] = useState(0);
  const navigationState = useMemo(() => ({ index, routes: [...PROFILE_LIKE_TAB_ROUTES] }), [index]);

  return (
    <Container>
      <Tab onIndexChange={setIndex} navigationState={navigationState} renderScene={renderScene} />
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

const Container = styled(YStack, {
  flex: 1
});

const EmptyWrap = styled(View, {
  flex: 1,
  items: 'center',
  justify: 'center',
  py: 60
});
