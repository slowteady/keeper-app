import { BottomSheetView } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { GestureResponderEvent } from 'react-native';
import { styled, useTheme, View, XStack, YStack } from 'tamagui';

import { ADOPT_ANIMAL_TYPES, AnimalType } from '@/domains/animal';
import { AdoptCard, AdoptCardSchema, adoptListValue, COMMUNITY_LIST_FILTER } from '@/entities';
import { communityAdoptFilterAtom } from '@/features';
import { BottomSheetMenu, ButtonGroup, ChipButton, useBottomSheet, useLoginRequired } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

export const AdoptTab = () => {
  const [adoptFilter, setAdoptFilter] = useAtom(communityAdoptFilterAtom);

  const { requireLogin } = useLoginRequired();
  const { present, dismiss } = useBottomSheet();
  const { black500 } = useTheme();

  const handleChangeAnimalType = useCallback(
    (id: AnimalType) => {
      setAdoptFilter((prev) => ({ ...prev, animalType: id }));
    },
    [setAdoptFilter]
  );
  const handleChangeFilter = useCallback((filter: 'LOCATION' | 'PROMO') => {}, []);
  const handlePressFilter = useCallback(
    (event: GestureResponderEvent) => {
      present(
        <BottomSheetView>
          <BottomSheetMenu
            data={COMMUNITY_LIST_FILTER}
            value={adoptFilter.filter}
            onPress={(data) => {
              setAdoptFilter((prev) => ({ ...prev, filter: data.id }));
              dismiss();
            }}
          />
        </BottomSheetView>,
        { snapPoints: [280] }
      );
    },
    [adoptFilter.filter, dismiss, present, setAdoptFilter]
  );
  const handlePressUser = useCallback((item: AdoptCardSchema['user']) => {
    // TODO: 유저 프로필 페이지로 이동
  }, []);
  const handlePressCard = useCallback((id: string) => {
    // TODO: 게시글 상세 페이지로 이동
  }, []);
  const handlePressLike = useCallback(
    (id: string) => {
      // TODO: 좋아요 처리
      requireLogin(() => {});
    },
    [requireLogin]
  );

  const filterText = COMMUNITY_LIST_FILTER.find((filter) => filter.id === adoptFilter.filter)?.label || '';
  const data = adoptListValue();

  return (
    <Container>
      <FlashList
        data={data}
        renderItem={({ item }) => (
          <View px={20} py={32}>
            <AdoptCard
              {...item}
              onPressUser={() => handlePressUser(item.user)}
              onPressCard={() => handlePressCard(item.id)}
              onPressLike={() => handlePressLike(item.id)}
              isLoading={false}
            />
          </View>
        )}
        ListEmptyComponent={<></>}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <Divider />}
        ListHeaderComponent={
          <View px={20}>
            <ButtonGroup data={ADOPT_ANIMAL_TYPES} id={adoptFilter.animalType} onChange={handleChangeAnimalType} />

            <XStack mt={16} gap={4}>
              <ChipButton isPressable onPress={() => handleChangeFilter('LOCATION')}>
                내 근처
              </ChipButton>
              <ChipButton isPressable onPress={() => handleChangeFilter('PROMO')}>
                입양홍보
              </ChipButton>
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
