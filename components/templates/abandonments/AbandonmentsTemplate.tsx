import { abandonmentBusiness, AbandonmentBusinessResult } from '@/businesses/abandonmentBusiness';
import ScrollFloatingButton from '@/components/atoms/button/ScrollFloatingButton';
import { Skeleton } from '@/components/molecules/placeholder/Skeleton';
import BasicTab from '@/components/molecules/tab/BasicTab';
import { BasicCard } from '@/components/organisms/card/BasicCard';
import { ABANDONMENTS_CONF } from '@/constants/config';
import theme from '@/constants/theme';
import { AbandonmentsConfigValue, AbandonmentsFilter } from '@/types/abandonments';
import { AbandonmentValue } from '@/types/scheme/abandonments';
import { router } from 'expo-router';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ListRenderItemInfo,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

// TODO
// [ ] Provider 만들어서 데이터 흐름 관리, tab, cardlist sections로 이전
interface AbandonmentsTemplateProps {
  abandonmentsFilter: AbandonmentsConfigValue;
  data?: AbandonmentValue[];
  onChange: (value: AbandonmentsConfigValue) => void;
  onFetch: () => void;
  isLoading: boolean;
}
const AbandonmentsTemplate = ({
  abandonmentsFilter,
  data,
  isLoading,
  onChange,
  onFetch
}: AbandonmentsTemplateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleWrap}>
        <Text style={styles.title}>전체공고</Text>
      </View>

      <BasicTab category={ABANDONMENTS_CONF} value={abandonmentsFilter} onChange={onChange} />
      <AbandonmentCardList onFetch={onFetch} data={data} isLoading={isLoading} filter={abandonmentsFilter.value} />
    </View>
  );
};

export default AbandonmentsTemplate;

interface AbandonmentCardListProps {
  data?: AbandonmentValue[];
  onFetch: () => void;
  isLoading: boolean;
  filter: AbandonmentsFilter;
}
const CARD_GAP = 4;
const PADDING_HORIZONTAL = 20;
const AbandonmentCardList = memo(({ data, onFetch, isLoading, filter }: AbandonmentCardListProps) => {
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const lastScrollOffset = useRef(0);
  const flatListRef = useRef<FlatList>(null);

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

  const handlePress = useCallback((id: number) => {
    router.push({ pathname: '/abandonments/[id]', params: { id } });
  }, []);

  const formattedAbandonmentData = abandonmentBusiness(data || [], filter);
  const imageWidth = useMemo(() => (Dimensions.get('screen').width - PADDING_HORIZONTAL * 2) / 2 - CARD_GAP, []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<AbandonmentBusinessResult>) => {
      return (
        <Pressable onPress={() => handlePress(item.id)}>
          <AbandonmentCard width={imageWidth} data={item} isLoading={isLoading} />
        </Pressable>
      );
    },
    [handlePress, imageWidth, isLoading]
  );

  return (
    <>
      <FlatList
        ref={flatListRef}
        onScroll={handleScroll}
        data={formattedAbandonmentData}
        renderItem={renderItem}
        numColumns={2}
        initialNumToRender={10}
        keyExtractor={({ id }, idx) => `${id}-${idx}`}
        scrollEventThrottle={40}
        showsVerticalScrollIndicator={false}
        bounces
        decelerationRate="fast"
        onEndReached={onFetch}
        onEndReachedThreshold={1}
        columnWrapperStyle={{ gap: CARD_GAP, justifyContent: 'space-between' }}
        contentContainerStyle={{ marginTop: 22, gap: 34 }}
      />
      <ScrollFloatingButton visible={isButtonVisible} onPress={handlePressScrollButton} />
    </>
  );
});

interface AbandonmentCardProps {
  width: number;
  data: AbandonmentBusinessResult;
  isLoading: boolean;
}
const IMAGE_HEIGHT = 140;
const AbandonmentCard = ({ width, data, isLoading }: AbandonmentCardProps) => {
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
      <View style={{ width, height: IMAGE_HEIGHT, marginBottom: 20 }}>
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
    position: 'relative'
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 20
  },
  title: {
    color: theme.colors.black[900],
    fontSize: 26,
    fontWeight: '500'
  },
  chipBlockContainer: {
    gap: 4,
    marginBottom: 20,
    minHeight: 0
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
  cardTitle: {
    color: theme.colors.black[900],
    fontSize: 17,
    fontWeight: '500',
    marginBottom: 14
  },
  primaryDescription: {
    fontSize: 11,
    lineHeight: 11,
    minWidth: 40
  },
  secondaryDescription: {
    fontSize: 11,
    lineHeight: 11
  }
});

AbandonmentCardList.displayName = 'AbandonmentCardList';
