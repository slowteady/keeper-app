import { FlashList } from '@shopify/flash-list';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { AdoptCard, COMMUNITY_LIST_FILTER } from '@/entities';
import { useLikePost, usePostFilter } from '@/features';
import { ADOPT_ANIMAL, ButtonGroup, ChipButton } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

import { useCommunityAdoptFeed } from '../model/useCommunityAdoptFeed';

export const CommunityAdoptFeed = () => {
  const { black500 } = useTheme();

  const { toggleLike, isLiking } = useLikePost();
  const { filter, handleChangeAnimalType, handlePressFilter } = usePostFilter();

  const { data, actions } = useCommunityAdoptFeed();
  const { moveDetailPage } = actions;

  const filterText = COMMUNITY_LIST_FILTER.find((f) => f.id === filter.filter)?.label || '';

  return (
    <Container>
      <FlashList
        data={data.adoptListData}
        renderItem={({ item }) => (
          <View px={20} py={32}>
            <AdoptCard
              {...item}
              onPressCard={() => moveDetailPage(item.id)}
              onPressLike={() => toggleLike(item.id)}
              isLoading={isLiking}
            />
          </View>
        )}
        ListEmptyComponent={<></>}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={
          <View px={20}>
            <ButtonGroup data={ADOPT_ANIMAL} id={filter.animalType} onChange={handleChangeAnimalType} />

            <XStack mt={16} gap={4}>
              <ChipButton
                onPress={handlePressFilter}
                right={<DownArrow width={12} height={12} color={black500.val} style={{ marginLeft: 4 }} />}
              >
                {filterText}
              </ChipButton>
            </XStack>
          </View>
        }
      />
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
