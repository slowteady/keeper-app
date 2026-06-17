import { FlashList, FlashListRef, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { PersonalAdoptCard, PersonalAdoptCardSkeleton, PersonalAdoptItem } from '@/entities/adopt';
import { useLikePost } from '@/features/like-post';
import { FeedNodata } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

const CARD_GAP = 12;
const CARD_WIDTH = Math.round(Dimensions.get('window').width * 0.72);

export type HomePersonalSectionProps = {
  convertedData: PersonalAdoptItem[];
  isLoading: boolean;
  onGoDetail: (id: string) => void;
  onGoList: () => void;
};

export const HomePersonalSection = ({ convertedData, isLoading, onGoDetail, onGoList }: HomePersonalSectionProps) => {
  const scrollRef = useRef<FlashListRef<PersonalAdoptItem>>(null);
  const { black500 } = useTheme();
  const { toggleLikePost } = useLikePost();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<PersonalAdoptItem>) => (
      <View width={CARD_WIDTH}>
        <PersonalAdoptCard
          uri={item.uri}
          imageCount={item.imageCount}
          title={item.title}
          intro={item.intro}
          breed={item.breed}
          region={item.region}
          dateText={item.dateText}
          chips={item.chips}
          protectionType={item.protectionType}
          isLiked={item.isLiked}
          completed={item.completed}
          onPress={() => onGoDetail(item.id)}
          onPressFavorite={() => toggleLikePost(item.id, item.isLiked)}
        />
      </View>
    ),
    [onGoDetail, toggleLikePost]
  );

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          최근 개인 공고
        </Text>
        <XStack items="center" gap={2} mt={12} onPress={onGoList}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
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
        style={{ paddingLeft: 20 }}
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
