import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import {
  ADOPT_CARD_IMAGE_SIZES,
  PersonalAdoptCard,
  PersonalAdoptCardSkeleton,
  PersonalAdoptItem
} from '@/entities/adopt';
import { useLikePost } from '@/features/like-post';
import { SCREEN_GUTTER } from '@/shared/lib';
import { FeedNodata } from '@/shared/ui';

const CARD_GAP = 12;
const CARD_WIDTH = ADOPT_CARD_IMAGE_SIZES.medium;

export type HomePersonalSectionProps = {
  convertedData: PersonalAdoptItem[];
  isLoading: boolean;
  onGoDetail: (id: string) => void;
  onGoList: () => void;
};

export const HomePersonalSection = ({ convertedData, isLoading, onGoDetail, onGoList }: HomePersonalSectionProps) => {
  const scrollRef = useRef<FlashListRef<PersonalAdoptItem>>(null);
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PersonalAdoptItem>) => (
      <View width={CARD_WIDTH}>
        <PersonalAdoptCard
          compact
          coreChipsOnly
          uri={item.uri}
          imageCount={item.imageCount}
          title={item.title}
          breed={item.breed}
          region={item.region}
          chips={item.chips}
          protectionType={item.protectionType}
          isLiked={item.isLiked}
          completed={item.completed}
          hasVideo={item.hasVideo}
          videoDuration={item.videoDuration}
          onPress={() => onGoDetail(item.id)}
          onPressFavorite={() => toggleLikePost(item.id, item.isLiked)}
        />
      </View>
    ),
    [onGoDetail, toggleLikePost]
  );

  return (
    <>
      <HeaderContainer px={SCREEN_GUTTER} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          개인 공고
        </Text>
        <XStack items="center" mt={12} onPress={onGoList}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
        </XStack>
      </HeaderContainer>

      <FlashList
        ref={scrollRef}
        data={convertedData ?? []}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        renderItem={renderItem}
        horizontal
        snapToInterval={CARD_WIDTH + CARD_GAP}
        snapToAlignment="start"
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View width={CARD_GAP} />}
        contentContainerStyle={{ paddingRight: 20 }}
        style={{ paddingLeft: 20, height: 284 }}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
      />
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <View width={CARD_WIDTH}>
        <PersonalAdoptCardSkeleton />
      </View>
    );
  }

  return (
    <EmptyWrap>
      <FeedNodata />
    </EmptyWrap>
  );
};

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const EmptyWrap = styled(View, {
  width: Dimensions.get('window').width - 40,
  items: 'center',
  justify: 'center'
});
