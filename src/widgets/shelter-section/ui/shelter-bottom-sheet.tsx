import BottomSheet, { BottomSheetFlatList, type BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ListRenderItemInfo } from 'react-native';
import { SharedValue } from 'react-native-reanimated';
import { styled, Text, useTheme, View, YStack } from 'tamagui';

import { ShelterCard, ShelterDto } from '@/entities/shelter';
import { Skeleton } from '@/shared/ui';

type ShelterBottomSheetProps = {
  shelters?: ShelterDto[];
  selectedShelterId?: string;
  isLoading: boolean;
  animatedIndex?: SharedValue<number>;
  topInset?: number;
  onPressCard: (id: string) => void;
  onPressFavorite: (careRegNo: string, currentlyFavorited: boolean) => void;
};

export const ShelterBottomSheet = ({
  shelters,
  selectedShelterId,
  isLoading,
  animatedIndex,
  topInset,
  onPressCard,
  onPressFavorite
}: ShelterBottomSheetProps) => {
  const listRef = useRef<BottomSheetFlatListMethods>(null);
  const snapPoints = useMemo(() => ['12%', '45%', '90%'], []);
  const count = shelters?.length ?? 0;
  const { white800 } = useTheme();

  useEffect(() => {
    if (!selectedShelterId || !shelters?.length) return;
    const index = shelters.findIndex((item) => item.id === selectedShelterId);
    if (index >= 0) listRef.current?.scrollToIndex({ index, animated: true });
  }, [selectedShelterId, shelters]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ShelterDto>) => (
      <View px={20} py={5}>
        <ShelterCard
          data={item}
          isSelected={item.id === selectedShelterId}
          onPress={onPressCard}
          onPressFavorite={onPressFavorite}
        />
      </View>
    ),
    [onPressCard, onPressFavorite, selectedShelterId]
  );

  return (
    <BottomSheet
      index={0}
      snapPoints={snapPoints}
      enableDynamicSizing={false}
      animatedIndex={animatedIndex}
      topInset={topInset}
      handleIndicatorStyle={{ width: 48, borderRadius: 30, backgroundColor: white800.val }}
    >
      <Header>
        <Text fontSize={15} lineHeight={18} fontWeight="600" color="$black900">
          이 지역 보호소 {count}곳
        </Text>
      </Header>
      <BottomSheetFlatList
        ref={listRef}
        data={shelters ?? []}
        keyExtractor={(item: ShelterDto) => item.id}
        renderItem={renderItem}
        onScrollToIndexFailed={() => undefined}
        ItemSeparatorComponent={() => <View height={6} />}
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
