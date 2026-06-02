import BottomSheet, { BottomSheetFlatList, type BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { ShelterCard, ShelterDto } from '@/entities/shelter';
import { Skeleton } from '@/shared/ui';

type ShelterBottomSheetProps = {
  shelters?: ShelterDto[];
  selectedShelterId?: string;
  isLoading: boolean;
  onPressCard: (id: string) => void;
  onPressFavorite: (careRegNo: string, currentlyFavorited: boolean) => void;
};

export const ShelterBottomSheet = ({
  shelters,
  selectedShelterId,
  isLoading,
  onPressCard,
  onPressFavorite
}: ShelterBottomSheetProps) => {
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const snapPoints = useMemo(() => ['12%', '45%', '90%'], []);
  const count = shelters?.length ?? 0;

  // 마커 선택 → 해당 카드로 스크롤 (마커 → 카드 동기화)
  useEffect(() => {
    if (!selectedShelterId || !shelters?.length) return;
    const index = shelters.findIndex((item) => item.id === selectedShelterId);
    if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true });
  }, [selectedShelterId, shelters]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => (
      <View px={20} py={5}>
        <ShelterCard data={item} onPress={onPressCard} onPressFavorite={onPressFavorite} />
      </View>
    ),
    [onPressCard, onPressFavorite]
  );

  return (
    <BottomSheet index={1} snapPoints={snapPoints} enableDynamicSizing={false}>
      <Header>
        <Text fontSize={15} lineHeight={18} fontWeight="600" color="$black900">
          내 주변 보호소 {count}곳
        </Text>
      </Header>
      <BottomSheetFlatList
        ref={listRef}
        data={shelters ?? []}
        keyExtractor={(item: ShelterDto) => item.id}
        renderItem={renderItem}
        onScrollToIndexFailed={() => undefined}
        ItemSeparatorComponent={() => <View height={10} />}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={<EmptyComponent isLoading={isLoading} />}
        showsVerticalScrollIndicator={false}
      />
    </BottomSheet>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) =>
  isLoading ? (
    <YStack gap={10} px={20}>
      {Array.from({ length: 4 }).map((_, idx) => (
        <View key={`shelter-skeleton-${idx}`} height={80}>
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        </View>
      ))}
    </YStack>
  ) : (
    <View px={20} py={42} items="center">
      <Text fontSize={15} lineHeight={17} fontWeight="500" color="$black500">
        이 지역에 보호소가 없어요
      </Text>
    </View>
  );

const Header = styled(View, {
  px: 20,
  pb: 12
});
