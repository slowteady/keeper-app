import { abandonmentBusiness, AbandonmentBusinessResult } from '@/businesses/abandonmentBusiness';
import { Toggle } from '@/components/molecules/button/Toggle';
import { BasicCard } from '@/components/molecules/card/BasicCard';
import { TextField } from '@/components/molecules/input/TextField';
import { MAIN_ABANDONMENTS_TOGGLE_CONF } from '@/constants/main';
import theme from '@/constants/theme';
import { useGetAbandonments } from '@/hooks/queries/useAbandonments';
import { useAbandonmentsContext } from '@/states/AbandonmentsProvider';
import { AbandonmentsFilter } from '@/type/abandonments';
import { AbandonmentData } from '@/type/scheme/abandonments';
import { useCallback, useEffect, useState } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet, Text, View } from 'react-native';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 10;
const MainAbandonmentSection = () => {
  const { animalType = 'ALL' } = useAbandonmentsContext();
  const [page, setPage] = useState(DEFAULT_PAGE);
  const [filter, setFilter] = useState<AbandonmentsFilter>('NEAR_DEADLINE');
  const [searchValue, setSearchValue] = useState('');

  const { data, isLoading } = useGetAbandonments({ animalType, page, size: DEFAULT_SIZE, filter, search: searchValue });

  useEffect(() => {
    const resetState = () => {
      setPage(DEFAULT_PAGE);
      setFilter('NEAR_DEADLINE');
      setSearchValue('');
    };

    resetState();
  }, [animalType]);

  const handleSubmit = useCallback((text: string) => {
    setSearchValue(text);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>전체공고</Text>
      <View style={styles.toggleWrap}>
        <Toggle items={MAIN_ABANDONMENTS_TOGGLE_CONF} value={filter} interval={4} onChange={setFilter} />
      </View>
      <TextField.Searchbar onSubmit={handleSubmit} />
      <AbandonmentCardList data={data} isLoading={isLoading} filter={filter} />
    </View>
  );
};

export default MainAbandonmentSection;

interface MainAbandonmentSectionCardListProps {
  data?: AbandonmentData;
  isLoading: boolean;
  filter: AbandonmentsFilter;
}
const CARD_GAP = 18;
const IMAGE_WIDTH = 220;
const IMAGE_HEIGHT = 170;
const AbandonmentCardList = ({ data, isLoading, filter }: MainAbandonmentSectionCardListProps) => {
  const formattedAbandonmentData = abandonmentBusiness(data?.value || [], filter);

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
