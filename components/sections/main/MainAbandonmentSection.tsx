import { abandonmentBusiness, AbandonmentBusinessResult } from '@/businesses/abandonmentBusiness';
import { Toggle } from '@/components/molecules/button/Toggle';
import Searchbar from '@/components/molecules/input/Searchbar';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { MAIN_ABANDONMENTS_TOGGLE_CONF } from '@/constants/main';
import theme from '@/constants/theme';
import { useGetInfiniteAbandonments } from '@/hooks/queries/useAbandonments';
import { useAbandonmentsContext } from '@/states/AbandonmentsProvider';
import { AbandonmentsFilter } from '@/type/abandonments';
import { AbandonmentValue } from '@/type/scheme/abandonments';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const DEFAULT_SIZE = 10;
const MainAbandonmentSection = () => {
  const { animalType = 'ALL' } = useAbandonmentsContext();
  const [filter, setFilter] = useState<AbandonmentsFilter>('NEAR_DEADLINE');
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading, hasNextPage, fetchNextPage } = useGetInfiniteAbandonments({
    animalType,
    size: DEFAULT_SIZE,
    filter,
    search: searchValue
  });

  useEffect(() => {
    const resetState = () => {
      setFilter('NEAR_DEADLINE');
      setSearchValue('');
    };

    resetState();
  }, [animalType]);

  const handleSubmit = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  const handleFetchMore = () => {
    if (hasNextPage) fetchNextPage();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체공고</Text>
      <View style={styles.toggleWrap}>
        <Toggle items={MAIN_ABANDONMENTS_TOGGLE_CONF} value={filter} interval={4} onChange={setFilter} />
      </View>
      <Searchbar onSubmit={handleSubmit} />
      <AbandonmentCardList data={data} isLoading={isLoading} filter={filter} onFetch={handleFetchMore} />
    </View>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentValue[];
  isLoading: boolean;
  filter: AbandonmentsFilter;
  onFetch: () => void;
}
const CARD_GAP = 18;
const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = 170;
const AbandonmentCardList = ({ data, isLoading, filter, onFetch }: MainAbandonmentSectionCardListProps) => {
  const formattedAbandonmentData = abandonmentBusiness(data || [], filter);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AbandonmentBusinessResult>) => {
      return (
        <Pressable>
          <BasicCard isLoading={isLoading} data={item} width={IMAGE_WIDTH} height={IMAGE_HEIGHT} />
        </Pressable>
      );
    },
    [isLoading]
  );

  return (
    <FlatList
      data={formattedAbandonmentData}
      horizontal={true}
      renderItem={renderItem}
      scrollEventThrottle={40}
      showsHorizontalScrollIndicator={false}
      keyExtractor={({ id }, idx) => `${id}-${idx}`}
      onEndReached={onFetch}
      onEndReachedThreshold={1}
      bounces
      initialNumToRender={4}
      decelerationRate="fast"
      snapToInterval={IMAGE_WIDTH + CARD_GAP}
      contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 8 }}
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
    fontWeight: '500',
    marginBottom: 28
  },
  toggleWrap: {
    marginBottom: 24,
    alignSelf: 'baseline'
  }
});
