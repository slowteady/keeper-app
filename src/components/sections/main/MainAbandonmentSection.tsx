import { TransformedAbandonments, transformAbandonments } from '@/business/abandonmentsBusiness';
import FullViewButton from '@/components/atoms/button/FullViewButton';
import { RightArrow } from '@/components/atoms/icons/solid';
import ButtonGroup from '@/components/molecules/button/ButtonGroup';
import Dropdown from '@/components/molecules/dropdown/Dropdown';
import { CardSkeleton } from '@/components/molecules/placeholder/CardSkeleton';
import { BottomSheetMenuData } from '@/components/organisms/bottomSheet/BottomSheet';
import { AnimalCard } from '@/components/organisms/card/AnimalCard';
import { ABANDONMENTS_ANIMAL_TYPES, ABANDONMENTS_FILTERS } from '@/constants/config';
import theme from '@/constants/theme';
import { useGetAbandonmentsQuery } from '@/hooks/queries/useAbandonments';
import { abandonmentsAtom, abandonmentsFilterValueAtom } from '@/states/abandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const MainAbandonmentSection = () => {
  const [abandonmentsConfig, setAbandonmentsConfig] = useAtom(abandonmentsAtom);
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const snapPoints = useMemo(() => [200], []);

  const { data, isLoading } = useGetAbandonmentsQuery(
    {
      animalType: abandonmentsConfig.type,
      filter: abandonmentsConfig.filter,
      size: 20,
      page: 0
    },
    { staleTime: 1000 * 60 * 60 }
  );

  const handlePressCard = ({ id }: TransformedAbandonments) => {
    router.push({
      pathname: '/abandonments/[id]',
      params: { id }
    });
  };
  const handlePressTitle = () => {
    router.push('/abandonments');
  };
  const handlePressFilter = useCallback(
    (data: BottomSheetMenuData<AbandonmentsFilter>) => {
      const { value } = data;
      setAbandonmentsConfig((prev) => ({ ...prev, filter: value }));
    },
    [setAbandonmentsConfig]
  );
  const handleChangeType = useCallback(
    async (id: AnimalType) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setAbandonmentsConfig((prev) => ({ ...prev, type: id }));
    },
    [setAbandonmentsConfig]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Text style={styles.title}>전체공고</Text>
          <RightArrow width={11} height={18} color={theme.colors.black[900]} />
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
      <View style={styles.buttonGroupWrap}>
        <ButtonGroup data={ABANDONMENTS_ANIMAL_TYPES} id={abandonmentsConfig.type} onChange={handleChangeType} />
      </View>
      <View style={{ paddingLeft: 20 }}>
        <AbandonmentCardList
          data={data}
          filter={filterValue.value}
          onPress={handlePressCard}
          onPressMoreButton={handlePressTitle}
          isLoading={isLoading}
        />
      </View>
    </View>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentValue[];
  filter: AbandonmentsFilter;
  onPress: (item: TransformedAbandonments) => void;
  onPressMoreButton: () => void;
  isLoading: boolean;
}
const CARD_GAP = 18;
const IMAGE_WIDTH = 220;
const AbandonmentCardList = ({
  data,
  filter,
  onPress,
  isLoading,
  onPressMoreButton
}: MainAbandonmentSectionCardListProps) => {
  const flatListRef = useRef<FlatList | null>(null);
  const formattedAbandonmentData = transformAbandonments(data || [], filter);

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [data]);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransformedAbandonments>) => {
      return (
        <Pressable onPress={() => onPress(item)}>
          <AnimalCard data={item} width={IMAGE_WIDTH} />
        </Pressable>
      );
    },
    [onPress]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={formattedAbandonmentData}
      horizontal={true}
      renderItem={renderItem}
      scrollEventThrottle={40}
      showsHorizontalScrollIndicator={false}
      keyExtractor={({ id }, idx) => `${id}-${idx}`}
      bounces
      initialNumToRender={4}
      nestedScrollEnabled={true}
      decelerationRate="fast"
      snapToInterval={IMAGE_WIDTH + CARD_GAP}
      contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 8 }}
      ListFooterComponent={<FullViewButton onPress={onPressMoreButton} />}
      ListFooterComponentStyle={[styles.dropdownWrap, { paddingHorizontal: 40 }]}
      ListEmptyComponent={
        isLoading ? (
          <>
            {Array.from({ length: 4 }).map((_, idx) => (
              <CardSkeleton key={idx} width={IMAGE_WIDTH} />
            ))}
          </>
        ) : (
          <NodataCard />
        )
      }
    />
  );
};

const NodataCard = () => {
  return (
    <View style={styles.noDataContainer}>
      <View style={styles.noDataBox}>
        <Text style={styles.noDataBoxText}>[No Data]</Text>
      </View>
      <Text style={styles.noDataText}>공고가 없습니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white[900],
    paddingVertical: 56
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '500'
  },
  buttonGroupWrap: {
    marginBottom: 20,
    alignSelf: 'baseline',
    width: '100%',
    paddingHorizontal: 20
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20
  },
  label: {
    color: theme.colors.black[600],
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 16
  },
  dropdownWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  },
  noDataContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20
  },
  noDataBox: {
    width: IMAGE_WIDTH,
    height: undefined,
    aspectRatio: 5 / 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.default,
    borderRadius: 8
  },
  noDataBoxText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '500',
    color: theme.colors.black[500]
  },
  noDataText: {
    fontSize: 17,
    lineHeight: 19,
    fontWeight: '500',
    color: theme.colors.black[900]
  }
});
