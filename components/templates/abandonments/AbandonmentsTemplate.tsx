import { abandonmentsBusiness, AbandonmentsBusinessResult } from '@/businesses/abandonmentsBusiness';
import ScrollFloatingButton from '@/components/atoms/button/ScrollFloatingButton';
import { Toggle } from '@/components/molecules/button/Toggle';
import Searchbar from '@/components/molecules/input/Searchbar';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import {
  AbandonmentsBottomSheet,
  AbandonmentsBottomSheetMenuData
} from '@/components/organisms/bottomSheet/AbandonmentsBottomSheet';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { ABANDONMENTS_ANIMAL_TYPES, ABANDONMENTS_FILTERS } from '@/constants/abandonments.config';
import theme from '@/constants/theme';
import { abandonmentsAtom, abandonmentsFilterValueAtom } from '@/states/abandonments';
import { AbandonmentsFilter } from '@/types/abandonments';
import { AnimalType } from '@/types/common';
import { AbandonmentData } from '@/types/scheme/abandonments';
import { BottomSheetBackdrop, BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface AbandonmentsTemplateProps {
  data?: AbandonmentData;
  onFetch: () => void;
  isLoading: boolean;
}
const PADDING_HORIZONTAL = 20;
const CARD_GAP = 4;
const AbandonmentsTemplate = ({ data, onFetch, isLoading }: AbandonmentsTemplateProps) => {
  const setAbandonmentsConfig = useSetAtom(abandonmentsAtom);
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['20%'], []);

  const handlePressFilter = () => {
    bottomSheetModalRef.current?.present();
  };

  const handlePressFilterValue = useCallback(
    (data: AbandonmentsBottomSheetMenuData<AbandonmentsFilter>) => {
      const { value } = data;
      setAbandonmentsConfig((prev) => ({ ...prev, filter: value }));
      bottomSheetModalRef.current?.dismiss();
    },
    [setAbandonmentsConfig]
  );

  const handleAnimate = (fromIndex: number, toIndex: number) => {
    if (toIndex === 0) bottomSheetModalRef.current?.dismiss();
  };

  return (
    <>
      <AbandonmentList data={data} onPressFilter={handlePressFilter} onFetch={onFetch} isLoading={isLoading} />

      <AbandonmentsBottomSheet
        ref={bottomSheetModalRef}
        index={1}
        snapPoints={snapPoints}
        onAnimate={handleAnimate}
        backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
        containerStyle={{ paddingTop: 12 }}
      >
        <AbandonmentsBottomSheet.Menu
          data={ABANDONMENTS_FILTERS}
          value={filterValue.value}
          onPress={handlePressFilterValue}
        />
      </AbandonmentsBottomSheet>
    </>
  );
};

export default AbandonmentsTemplate;

interface AbandonmentListProps {
  data?: AbandonmentData;
  isLoading: boolean;
  onPressFilter: () => void;
  onFetch: () => void;
}
const AbandonmentList = ({ data, onPressFilter, onFetch, isLoading }: AbandonmentListProps) => {
  const filterValue = useAtomValue(abandonmentsFilterValueAtom);
  const abandonmentsConfig = useAtomValue(abandonmentsAtom);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const lastScrollOffset = useRef(0);
  const flatListRef = useRef<FlatList>(null);
  const { page, total, value, has_next } = data || {};
  const formattedAbandonmentData = abandonmentsBusiness(value || [], abandonmentsConfig.filter);

  const handlePressCard = (id: number) => {
    router.push({ pathname: '/abandonments/[id]', params: { id } });
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    const isScrollingUp = offset < lastScrollOffset.current;
    const isAboveThreshold = offset > 100;

    setIsButtonVisible(isScrollingUp && isAboveThreshold);
    lastScrollOffset.current = offset;
  }, []);

  const handlePressScrollButton = useCallback(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  return (
    <>
      <FlatList
        data={formattedAbandonmentData}
        ListHeaderComponent={<FilterSection filterName={filterValue.name} onPressFilter={onPressFilter} />}
        ListFooterComponent={
          has_next ? <MoreButtonSection onFetch={onFetch} page={page} total={total} isLoading={isLoading} /> : <></>
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePressCard(item.id)}>
            <AbandonmentCard data={item} isLoading={isLoading} />
          </Pressable>
        )}
        ref={flatListRef}
        onScroll={handleScroll}
        decelerationRate="fast"
        bounces
        numColumns={2}
        initialNumToRender={8}
        keyExtractor={({ id }) => String(id)}
        scrollEventThrottle={40}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ gap: CARD_GAP, justifyContent: 'space-between' }}
        contentContainerStyle={{ gap: 34 }}
        style={styles.container}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePressScrollButton} />
    </>
  );
};

interface FilterSectionProps {
  onPressFilter: () => void;
  filterName: string;
}
const FilterSection = ({ filterName, onPressFilter }: FilterSectionProps) => {
  const [abandonmentsConfig, setAbandonmentsConfig] = useAtom(abandonmentsAtom);

  const handleSubmit = (text: string) => {
    setAbandonmentsConfig((prev) => ({ ...prev, search: text }));
  };

  const handleChangeType = (value: AnimalType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setAbandonmentsConfig((prev) => ({ ...prev, type: value }));
  };

  return (
    <>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>전체공고</Text>

        <TouchableOpacity activeOpacity={0.5} onPress={onPressFilter}>
          <Text style={styles.filterText}>{filterName}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.toggleWrap}>
        <Toggle
          items={ABANDONMENTS_ANIMAL_TYPES}
          value={abandonmentsConfig.type}
          interval={4}
          onChange={handleChangeType}
        />
      </View>
      <Searchbar onSubmit={handleSubmit} ViewStyle={{ marginBottom: 14 }} />
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
      <TouchableOpacity style={styles.moreButton} activeOpacity={0.5} onPress={onFetch} disabled={isLoading}>
        {isLoading ? <ActivityIndicator /> : <Text style={styles.moreButtonText}>{text}</Text>}
      </TouchableOpacity>
    </View>
  );
};

interface AbandonmentCardProps {
  data: AbandonmentsBusinessResult;
  isLoading: boolean;
}
const AbandonmentCard = ({ data, isLoading }: AbandonmentCardProps) => {
  const [isLoad, setIsLoad] = useState(false);
  const [timeoutExceeded, setTimeoutExceeded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isLoad) {
        setTimeoutExceeded(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isLoad]);

  const width = useMemo(() => (Dimensions.get('screen').width - PADDING_HORIZONTAL * 2) / 2 - CARD_GAP, []);
  const { uri, title, description, chips } = data;
  const sortedChips = chips
    .map(({ chipStyle, containerStyle, ...rest }) => {
      return {
        chipStyle: { ...styles.chipText, ...chipStyle },
        containerStyle: { ...styles.chipsContainer, ...containerStyle },
        ...rest
      };
    })
    .sort((a, b) => a.sort - b.sort);
  const isCompleteLoad = !isLoading && isLoad && !timeoutExceeded;

  return (
    <View style={{ width }}>
      <View style={{ width, height: width * 0.8, marginBottom: 20 }}>
        {!isCompleteLoad && <Skeleton />}
        {uri && !timeoutExceeded ? (
          <BasicCard.Image source={{ uri }} onLoad={() => setIsLoad(true)} />
        ) : (
          <BasicCard.NoImage />
        )}
      </View>
      <BasicCard.Title style={styles.cardTitle}>{title}</BasicCard.Title>
      <BasicCard.Chips data={sortedChips} style={styles.chipBlockContainer} />
      <BasicCard.Descriptions
        data={description}
        primaryStyle={styles.primaryDescription}
        secondaryStyle={styles.secondaryDescription}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: PADDING_HORIZONTAL,
    paddingVertical: 48,
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
    fontSize: 26,
    fontWeight: '500'
  },
  filterText: {
    color: theme.colors.black[500],
    ...theme.fonts.medium
  },
  toggleWrap: {
    marginBottom: 16,
    alignSelf: 'baseline'
  },
  moreButtonContainer: {
    display: 'flex',
    paddingVertical: 30,
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
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 14
  },
  chipsContainer: {
    alignSelf: 'baseline',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 3
  },
  chipText: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 14
  },
  primaryDescription: {
    fontSize: 11,
    lineHeight: 11,
    minWidth: 40
  },
  secondaryDescription: {
    fontSize: 11,
    lineHeight: 11
  },
  chipBlockContainer: {
    gap: 4,
    marginBottom: 20,
    minHeight: 0
  },
  cardTitle: {
    color: theme.colors.black[900],
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 14
  }
});

FilterSection.displayName = 'FilterSection';
