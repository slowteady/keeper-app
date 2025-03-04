import { AbandonmentsBusinessResult, abandonmentsBusiness } from '@/businesses/abandonmentsBusiness';
import FullViewButton from '@/components/atoms/button/FullViewButton';
import { MenuArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { Toggle } from '@/components/molecules/button/Toggle';
import Dropdown from '@/components/molecules/dropdown/Dropdown';
import { DropdownBottomSheetMenuData } from '@/components/organisms/bottomSheet/DropdownBottomSheet';
import { AnimalCard } from '@/components/organisms/card/AnimalCard';
import { ABANDONMENTS_ANIMAL_TYPES, ABANDONMENTS_FILTERS } from '@/constants/config';
import theme from '@/constants/theme';
import { useGetAbandonments } from '@/hooks/queries/useAbandonments';
import { abandonmentsAtom, abandonmentsFilterValueAtom } from '@/states/abandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const MainAbandonmentSection = () => {
  const [abandonmentsConfig, setAbandonmentsConfig] = useAtom(abandonmentsAtom);
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const snapPoints = useMemo(() => ['20%'], []);

  const { data, isLoading } = useGetAbandonments(
    {
      animalType: abandonmentsConfig.type,
      filter: abandonmentsConfig.filter,
      size: 20,
      page: 1
    },
    { staleTime: 1000 * 60 * 60 }
  );

  const handlePressCard = ({ id }: AbandonmentsBusinessResult) => {
    router.push({
      pathname: '/abandonments/[id]',
      params: { id }
    });
  };
  const handlePressTitle = () => {
    router.push('/abandonments');
  };
  const handlePressFilter = useCallback(
    (data: DropdownBottomSheetMenuData<AbandonmentsFilter>) => {
      const { value } = data;
      setAbandonmentsConfig((prev) => ({ ...prev, filter: value }));
    },
    [setAbandonmentsConfig]
  );
  const handleChangeToggle = (value: AnimalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAbandonmentsConfig((prev) => ({ ...prev, type: value }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Text style={styles.title}>전체공고</Text>
          <MenuArrowIcon />
        </Pressable>

        <View style={{ marginTop: 12 }}>
          <Dropdown
            data={ABANDONMENTS_FILTERS}
            value={filterValue.value}
            onChange={handlePressFilter}
            snapPoints={snapPoints}
          />
        </View>
      </View>

      <View style={styles.toggleWrap}>
        <Toggle items={ABANDONMENTS_ANIMAL_TYPES} value={abandonmentsConfig.type} onChange={handleChangeToggle} />
      </View>

      <AbandonmentCardList
        data={data}
        filter={filterValue.value}
        onPress={handlePressCard}
        onPressMoreButton={handlePressTitle}
      />
    </View>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentValue[];
  filter: AbandonmentsFilter;
  onPress: (item: AbandonmentsBusinessResult) => void;
  onPressMoreButton: () => void;
}
const CARD_GAP = 18;
const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = 170;
const AbandonmentCardList = ({ data, filter, onPress, onPressMoreButton }: MainAbandonmentSectionCardListProps) => {
  const formattedAbandonmentData = abandonmentsBusiness(data || [], filter);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AbandonmentsBusinessResult>) => {
      return (
        <Pressable onPress={() => onPress(item)}>
          <AnimalCard data={item} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
        </Pressable>
      );
    },
    [onPress]
  );

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
      ListFooterComponent={<FullViewButton onPress={onPressMoreButton} />}
      ListFooterComponentStyle={[styles.dropdownWrap, { paddingHorizontal: 20 }]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white[900],
    paddingHorizontal: 20,
    paddingVertical: 56
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center'
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 32,
    fontWeight: '500'
  },
  toggleWrap: {
    marginBottom: 16,
    alignSelf: 'baseline'
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30
  },
  label: {
    color: theme.colors.black[600],
    ...theme.fonts.medium
  },
  dropdownWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
