import { AbandonmentBusinessResult, abandonmentsBusiness } from '@/businesses/abandonmentsBusiness';
import FullViewButton from '@/components/atoms/button/FullViewButton';
import { NavArrowIcon } from '@/components/atoms/icons/ArrowIcon';
import { Toggle } from '@/components/molecules/button/Toggle';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { ABANDONMENTS_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { useGetAbandonments } from '@/hooks/queries/useAbandonments';
import { useAbandonmentsContext } from '@/states/AbandonmentsProvider';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const DEFAULT_SIZE = 20;
const MainAbandonmentSection = () => {
  const { animalType = 'ALL' } = useAbandonmentsContext();
  const [filter, setFilter] = useState<AbandonmentsFilter>('NEAR_DEADLINE');

  const { data, isLoading } = useGetAbandonments({ animalType, filter, size: DEFAULT_SIZE, page: 1 });

  useEffect(() => {
    const resetState = () => {
      setFilter('NEAR_DEADLINE');
    };

    resetState();
  }, [animalType]);

  const handlePress = (item: AbandonmentBusinessResult) => {
    const { id } = item;

    router.push({
      pathname: '/abandonments/[id]',
      params: { id }
    });
  };

  const handlePressButton = () => {
    router.push('/abandonments');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>전체공고</Text>
        <Pressable style={styles.flex} onPress={handlePressButton}>
          <Text style={styles.label}>전체보기</Text>
          <NavArrowIcon />
        </Pressable>
      </View>
      <View style={styles.toggleWrap}>
        <Toggle items={ABANDONMENTS_CONF} value={filter} interval={4} onChange={setFilter} />
      </View>
      <AbandonmentCardList
        data={data}
        isLoading={isLoading}
        filter={filter}
        onPress={handlePress}
        onPressMoreButton={handlePressButton}
      />
    </View>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentValue[];
  isLoading: boolean;
  filter: AbandonmentsFilter;
  onPress: (item: AbandonmentBusinessResult) => void;
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
    ({ item }: ListRenderItemInfo<AbandonmentBusinessResult>) => {
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
      keyExtractor={({ id }, idx) => `${id}-${idx}`}
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

const {
  colors: { black, white }
} = theme;
const styles = StyleSheet.create({
  container: {
    backgroundColor: white[900],
    paddingHorizontal: 20,
    paddingVertical: 48
  },
  title: {
    color: black[900],
    fontSize: 28,
    fontWeight: '500'
  },
  toggleWrap: {
    marginBottom: 40,
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
    color: black[600],
    fontSize: 15,
    fontWeight: '500'
  },
  flex: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center'
  }
});
