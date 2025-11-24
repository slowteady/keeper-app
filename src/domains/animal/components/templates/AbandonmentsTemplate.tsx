import * as Haptics from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useAtom, useAtomValue } from 'jotai';
import { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  Pressable,
  RefreshControlProps,
  StyleSheet,
  Text,
  View
} from 'react-native';

import {
  AnimalCard,
  BottomSheetMenuData,
  Button,
  ButtonGroup,
  CardSkeleton,
  Dropdown,
  ScrollUpButton,
  Searchbar,
  TAnimalType,
  theme,
  useScrollUpButton
} from '@/shared';

import { transformAbandonments, TransformedAbandonments } from '../../business/announcement.business';
import { ADOPT_ANIMAL_TYPES, ADOPT_FILTERS } from '../../constants';
import { adoptFilterAtomFamily } from '../../stores';
import { AnnouncementData, AnnouncementFilter } from '../../types/announcement.types';

interface AbandonmentsTemplateProps {
  data?: AnnouncementData;
  onFetch: () => void;
  isLoading: boolean;
  refreshControl: React.ReactElement<RefreshControlProps>;
}
const PADDING_HORIZONTAL = 20;
const CARD_GAP = 8;
const IMAGE_WIDTH = (Dimensions.get('screen').width - 2 * PADDING_HORIZONTAL - CARD_GAP) / 2;
export const AbandonmentsTemplate = ({ data, onFetch, isLoading, refreshControl }: AbandonmentsTemplateProps) => {
  const pathname = usePathname();
  const adoptFilter = useAtomValue(adoptFilterAtomFamily(pathname));

  const { isButtonVisible, handlePress, handleScroll, flatListRef } = useScrollUpButton();
  const { has_next, page, total, value = [] } = data || {};
  const transformedAbandonments = transformAbandonments(value, adoptFilter.filter);

  const handlePressCard = useCallback((id: string) => {
    router.push({ pathname: '/adopt/[id]', params: { id } });
  }, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransformedAbandonments>) => {
      return (
        <Pressable onPress={() => handlePressCard(item.id)}>
          <AnimalCard
            data={item}
            width={IMAGE_WIDTH}
            size="small"
            style={{ backgroundColor: theme.colors.white[900] }}
          />
        </Pressable>
      );
    },
    [handlePressCard]
  );
  const renderListFooter = useCallback(() => {
    if (!total || page === undefined || page === null) return;
    const totalPage = Math.ceil(total / 16);

    return (
      <View style={{ paddingBottom: 20 }}>
        {has_next && <MoreButtonSection onFetch={onFetch} page={page + 1} total={totalPage} isLoading={isLoading} />}
      </View>
    );
  }, [has_next, isLoading, onFetch, page, total]);

  return (
    <>
      <FlatList
        data={transformedAbandonments}
        renderItem={renderItem}
        ref={flatListRef}
        onScroll={handleScroll}
        decelerationRate="fast"
        bounces
        numColumns={2}
        initialNumToRender={8}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        scrollEventThrottle={40}
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}
        columnWrapperStyle={{ gap: CARD_GAP, marginBottom: 32, justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingHorizontal: PADDING_HORIZONTAL }}
        style={styles.container}
        ListHeaderComponent={<FilterSection />}
        ListFooterComponent={renderListFooter()}
        ListEmptyComponent={
          isLoading ? (
            <View>
              {Array.from({ length: 4 }).map((_, idx) => (
                <View key={idx} style={styles.skeltonContainer}>
                  <CardSkeleton width={IMAGE_WIDTH} />
                  <CardSkeleton width={IMAGE_WIDTH} />
                </View>
              ))}
            </View>
          ) : (
            <Nodata />
          )
        }
      />
      <ScrollUpButton visible={isButtonVisible} onPress={handlePress} />
    </>
  );
};

const FilterSection = () => {
  const pathname = usePathname();
  const [adoptFilter, setAdoptFilter] = useAtom(adoptFilterAtomFamily(pathname));
  const snapPoints = useMemo(() => [200], []);

  const handleSubmit = (text: string) => {
    setAdoptFilter((prev) => ({ ...prev, search: text }));
  };
  const handleChangeType = (id: TAnimalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAdoptFilter((prev) => ({ ...prev, animalType: id }));
  };
  const handlePressFilter = useCallback(
    (data: BottomSheetMenuData<AnnouncementFilter>) => {
      const { id } = data;
      setAdoptFilter((prev) => ({ ...prev, filter: id }));
    },
    [setAdoptFilter]
  );

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>전체공고</Text>
        <View style={{ marginTop: 12 }}>
          <Dropdown
            data={ADOPT_FILTERS}
            value={adoptFilter.filter}
            onChange={handlePressFilter}
            snapPoints={snapPoints}
          />
        </View>
      </View>
      <View style={styles.buttonGroupWrap}>
        <ButtonGroup data={ADOPT_ANIMAL_TYPES} id={adoptFilter.animalType} onChange={handleChangeType} />
      </View>
      <Searchbar
        onSubmit={handleSubmit}
        placeholder="품종 또는 지역을 입력해주세요."
        ViewStyle={{ marginBottom: 32 }}
      />
    </>
  );
};

interface MoreButtonSectionProps {
  onFetch: () => void;
  isLoading: boolean;
  page?: number;
  total?: number;
}
const MoreButtonSection = ({ onFetch, isLoading, page, total }: MoreButtonSectionProps) => {
  const text = `더보기 ${page}/${total}`;

  return (
    <View style={styles.moreButtonContainer}>
      <Button style={styles.moreButton} onPress={onFetch} disabled={isLoading}>
        {isLoading ? <ActivityIndicator size={16} /> : <Text style={styles.moreButtonText}>{text}</Text>}
      </Button>
    </View>
  );
};

const Nodata = () => {
  return (
    <View style={styles.noDataContainer}>
      <Text style={styles.noDataText}>공고가 없습니다.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 40,
    position: 'relative'
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 32,
    lineHeight: 34,
    fontWeight: '500'
  },
  filterText: {
    color: theme.colors.black[500],
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 17
  },
  buttonGroupWrap: {
    marginBottom: 16
  },
  moreButtonContainer: {
    display: 'flex',
    paddingBottom: 30,
    marginBottom: 20,
    alignSelf: 'center'
  },
  moreButton: {
    backgroundColor: theme.colors.black[800],
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'baseline',
    minWidth: 125
  },
  moreButtonText: {
    color: theme.colors.white[900],
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 15
  },
  noDataContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 300
  },
  noDataText: {
    fontSize: 20,
    fontWeight: '500',
    lineHeight: 22,
    color: theme.colors.black[500]
  },
  skeltonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: CARD_GAP
  }
});
