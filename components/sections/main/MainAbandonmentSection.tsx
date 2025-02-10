import { AbandonmentsBusinessResult, abandonmentsBusiness } from '@/businesses/abandonmentsBusiness';
import FullViewButton from '@/components/atoms/button/FullViewButton';
import { Toggle } from '@/components/molecules/button/Toggle';
import {
  AbandonmentsBottomSheet,
  AbandonmentsBottomSheetMenuData
} from '@/components/organisms/bottomSheet/AbandonmentsBottomSheet';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { ABANDONMENTS_ANIMAL_TYPES, ABANDONMENTS_FILTERS } from '@/constants/abandonments.config';
import theme from '@/constants/theme';
import { useGetAbandonments } from '@/hooks/queries/useAbandonments';
import { abandonmentsAtom, abandonmentsFilterValueAtom } from '@/states/abandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo, useRef } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DEFAULT_LIST_SIZE = 20;
const MainAbandonmentSection = () => {
  const [abandonmentsConfig, setAbandonmentsConfig] = useAtom(abandonmentsAtom);
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['20%'], []);

  const { data, isLoading } = useGetAbandonments({
    animalType: abandonmentsConfig.type,
    filter: abandonmentsConfig.filter,
    size: DEFAULT_LIST_SIZE,
    page: 1
  });

  const handlePressCard = (item: AbandonmentsBusinessResult) => {
    const { id } = item;

    router.push({
      pathname: '/abandonments/[id]',
      params: { id }
    });
  };

  const handleFilter = () => {
    bottomSheetModalRef.current?.present();
  };

  const handlePressAbandonments = () => {
    router.push('/abandonments');
  };

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetModalRef.current?.dismiss();
  };

  const handlePressFilter = useCallback(
    (data: AbandonmentsBottomSheetMenuData<AbandonmentsFilter>) => {
      const { value } = data;
      setAbandonmentsConfig((prev) => ({ ...prev, filter: value }));
      bottomSheetModalRef.current?.dismiss();
    },
    [setAbandonmentsConfig]
  );

  const handleChangeToggle = (value: AnimalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAbandonmentsConfig((prev) => ({ ...prev, type: value }));
  };

  const renderBackdrop = useCallback((props: BottomSheetBackdropProps) => {
    return <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />;
  }, []);

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={handlePressAbandonments}>
            <Text style={styles.title}>전체공고</Text>
          </Pressable>

          <TouchableOpacity activeOpacity={0.5} style={styles.flex} onPress={handleFilter}>
            <Text style={styles.label}>{filterValue.name}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.toggleWrap}>
          <Toggle
            items={ABANDONMENTS_ANIMAL_TYPES}
            value={abandonmentsConfig.type}
            interval={4}
            onChange={handleChangeToggle}
          />
        </View>
        <AbandonmentCardList
          data={data}
          isLoading={isLoading}
          filter={filterValue.value}
          onPress={handlePressCard}
          onPressMoreButton={handlePressAbandonments}
        />
      </View>

      <AbandonmentsBottomSheet
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        backdropComponent={renderBackdrop}
        containerStyle={{ paddingTop: 12 }}
      >
        <AbandonmentsBottomSheet.Menu
          data={ABANDONMENTS_FILTERS}
          value={filterValue.value}
          onPress={handlePressFilter}
        />
      </AbandonmentsBottomSheet>
    </>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentValue[];
  isLoading: boolean;
  filter: AbandonmentsFilter;
  onPress: (item: AbandonmentsBusinessResult) => void;
  onPressMoreButton: () => void;
}
const CARD_GAP = 18;
const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = 170;
const AbandonmentCardList = ({
  data,
  isLoading,
  filter,
  onPress,
  onPressMoreButton
}: MainAbandonmentSectionCardListProps) => {
  const formattedAbandonmentData = abandonmentsBusiness(data || [], filter);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AbandonmentsBusinessResult>) => {
      return (
        <Pressable onPress={() => onPress(item)}>
          <BasicCard isLoading={isLoading} data={item} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
        </Pressable>
      );
    },
    [isLoading, onPress]
  );

  const renderFooter = useCallback(() => {
    return <FullViewButton onPress={onPressMoreButton} />;
  }, [onPressMoreButton]);

  return (
    <FlatList
      data={formattedAbandonmentData}
      horizontal={true}
      renderItem={renderItem}
      scrollEventThrottle={40}
      showsHorizontalScrollIndicator={false}
      keyExtractor={({ id }) => id.toString()}
      onEndReachedThreshold={1}
      bounces
      initialNumToRender={4}
      decelerationRate="fast"
      snapToInterval={IMAGE_WIDTH + CARD_GAP}
      contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 8 }}
      ListFooterComponent={renderFooter}
      ListFooterComponentStyle={[styles.flex, { paddingHorizontal: 20 }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 20,
    paddingVertical: 48
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 28,
    fontWeight: '500'
  },
  toggleWrap: {
    marginBottom: 32,
    alignSelf: 'baseline'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28
  },
  label: {
    color: theme.colors.black[600],
    ...theme.fonts.medium
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
