import { AbandonmentsBusinessResult, abandonmentsBusiness } from '@/businesses/abandonmentsBusiness';
import FullViewButton from '@/components/atoms/button/FullViewButton';
import { Toggle } from '@/components/molecules/button/Toggle';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { ANIMAL_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { useGetAbandonments } from '@/hooks/queries/useAbandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DEFAULT_SIZE = 20;
const MainAbandonmentSection = () => {
  const [type, setType] = useState<AnimalType>('ALL');
  const [filter, setFilter] = useState<AbandonmentsFilter>('ALL');

  const { data, isLoading } = useGetAbandonments({ animalType: type, filter, size: DEFAULT_SIZE, page: 1 });

  const handlePressCard = (item: AbandonmentsBusinessResult) => {
    const { id } = item;

    router.push({
      pathname: '/abandonments/[id]',
      params: { id }
    });
  };

  const handleFilter = () => {
    // NOTE: 바텀시트
  };

  const handlePressAbandonments = () => {
    router.push('/abandonments');
  };

  const filterText = () => {
    switch (filter) {
      case 'ALL': {
        return '전체공고';
      }
      case 'NEAR_DEADLINE': {
        return '마감임박공고';
      }
      case 'NEW': {
        return '신규공고';
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handlePressAbandonments}>
          <Text style={styles.title}>전체공고</Text>
        </Pressable>

        <TouchableOpacity activeOpacity={0.5} style={styles.flex} onPress={handleFilter}>
          <Text style={styles.label}>{filterText()}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.toggleWrap}>
        <Toggle items={ANIMAL_CONF} value={type} interval={4} onChange={setType} />
      </View>
      <AbandonmentCardList
        data={data}
        isLoading={isLoading}
        filter={filter}
        onPress={handlePressCard}
        onPressMoreButton={handlePressAbandonments}
      />
    </View>
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
