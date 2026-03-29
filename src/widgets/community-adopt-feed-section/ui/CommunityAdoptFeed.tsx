import { FlashList } from '@shopify/flash-list';
import { GestureResponderEvent } from 'react-native';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { AnimalTypeDto, makeAdoptOption } from '@/entities/adopt';
import { COMMUNITY_LIST_FILTER, CommunityAdoptCard, CommunityAdoptListDto } from '@/entities/community';
import { useScrollUpButton } from '@/shared/model';
import { ButtonGroup, ChipButton, ScrollUpButton } from '@/shared/ui';
import { DownArrow } from '@/shared/ui/icons/mini';

export interface CommunityAdoptFeedProps {
  adoptList: CommunityAdoptListDto[];
  selectedFilter: string;
  selectedAnimalType: string;
  onChangeFilter: (event: GestureResponderEvent) => void;
  onChangeAnimalType: (id: AnimalTypeDto) => void;
  onGoDetailPage: (id: string) => void;
  onToggleLikePost: (id: string) => void;
}

export const CommunityAdoptFeed = ({
  adoptList,
  selectedFilter,
  selectedAnimalType,
  onChangeFilter,
  onChangeAnimalType,
  onGoDetailPage,
  onToggleLikePost
}: CommunityAdoptFeedProps) => {
  const { black500 } = useTheme();

  const { handleScroll, handlePressButton, isButtonVisible, scrollRef } = useScrollUpButton();

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === selectedFilter)?.label || '';

  return (
    <Container>
      <FlashList
        ref={scrollRef}
        onScroll={handleScroll}
        keyExtractor={({ id }, i) => `${id}-${i}`}
        data={adoptList}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListEmptyComponent={<></>}
        ListHeaderComponent={
          <View px={20}>
            <View mb={16}>
              <ButtonGroup
                data={makeAdoptOption('ANIMAL')}
                id={selectedAnimalType}
                onChange={(id) => onChangeAnimalType(id as AnimalTypeDto)}
              />
            </View>

            <XStack gap={4}>
              <ChipButton
                onPress={onChangeFilter}
                right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
              >
                {filterText}
              </ChipButton>
            </XStack>
          </View>
        }
        renderItem={({ item }) => (
          <View px={20} py={32}>
            <CommunityAdoptCard
              {...item}
              onPressCard={() => onGoDetailPage(item.id)}
              onPressLike={() => onToggleLikePost(item.id)}
            />
          </View>
        )}
      />

      <ScrollUpButton visible={isButtonVisible} onPress={handlePressButton} />
    </Container>
  );
};

const Container = styled(YStack, {
  flex: 1,
  py: 16
});

const Divider = styled(View, {
  height: 1,
  bg: '$white800'
});
