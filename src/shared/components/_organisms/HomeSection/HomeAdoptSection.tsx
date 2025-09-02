import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';
import { router, usePathname } from 'expo-router';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FlatList, ListRenderItemInfo, Pressable, StyleSheet } from 'react-native';
import { styled, Text, useTheme, View, XStack, YStack } from 'tamagui';

import {
  ADOPT_ANIMAL_TYPES,
  ADOPT_FILTERS,
  AdoptFilter,
  adoptFilterAtomFamily,
  AnimalType,
  useGetAdoptNoticesQuery
} from '@/domains/animal';
import { transformAbandonments, TransformedAbandonments } from '@/domains/animal/business/announcement.business';

import { ViewAllButton } from '../../_atoms';
import { RightArrow } from '../../_atoms/icons/solid';
import { ButtonGroup } from '../../molecules/ButtonGroup';
import { CardSkeleton } from '../../molecules/CardSkeleton';
import { Dropdown } from '../../molecules/Dropdown';
import { AnimalCard } from '../../organisms/AnimalCard';
import { BottomSheetMenuData } from '../../organisms/BottomSheet';

const IMAGE_WIDTH = 220;
const CARD_GAP = 18;

const HomeAdoptSection = () => {
  const pathname = usePathname();
  const [adoptFilter, setAdoptFilter] = useAtom(adoptFilterAtomFamily(pathname));

  const flatListRef = useRef<FlatList | null>(null);

  const { black900 } = useTheme();
  const snapPoints = useMemo(() => [200], []);

  const { data, isLoading } = useGetAdoptNoticesQuery(
    { ...adoptFilter, size: 20 },
    { staleTime: 1000 * 60 * 60, initialPageParam: 0, getNextPageParam: () => undefined }
  );

  const formattedAdoptData = transformAbandonments(data?.value || [], adoptFilter.filter);

  const handlePressCard = useCallback(({ id }: TransformedAbandonments) => {
    router.push({
      pathname: '/adopt/[id]',
      params: { id }
    });
  }, []);
  const handlePressTitle = () => {
    router.push('/adopt');
  };
  const handlePressFilter = useCallback(
    (data: BottomSheetMenuData<AdoptFilter>) => {
      const { value } = data;
      setAdoptFilter((prev) => ({ ...prev, filter: value }));
    },
    [setAdoptFilter]
  );
  const handleChangeType = useCallback(
    async (id: AnimalType) => {
      await impactAsync(ImpactFeedbackStyle.Light);
      setAdoptFilter((prev) => ({ ...prev, animalType: id }));
    },
    [setAdoptFilter]
  );
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<TransformedAbandonments>) => {
      return (
        <Pressable onPress={() => handlePressCard(item)}>
          <AnimalCard data={item} width={IMAGE_WIDTH} />
        </Pressable>
      );
    },
    [handlePressCard]
  );

  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ animated: false, offset: 0 });
    }
  }, [adoptFilter]);

  return (
    <Container>
      <TitleContainer>
        <Pressable onPress={handlePressTitle} style={styles.titleWrap}>
          <Title>전체공고</Title>
          <RightArrow width={11} height={18} color={black900.val} />
        </Pressable>

        <View mt={12}>
          <Dropdown
            data={ADOPT_FILTERS}
            value={adoptFilter.filter}
            onChange={handlePressFilter}
            snapPoints={snapPoints}
          />
        </View>
      </TitleContainer>

      <ButtonGroupWrap>
        <ButtonGroup data={ADOPT_ANIMAL_TYPES} id={adoptFilter.animalType} onChange={handleChangeType} />
      </ButtonGroupWrap>

      <View pl={20}>
        <FlatList
          keyExtractor={({ id }, idx) => `${id}-${idx}`}
          ref={flatListRef}
          data={formattedAdoptData}
          renderItem={renderItem}
          horizontal
          scrollEventThrottle={40}
          showsHorizontalScrollIndicator={false}
          initialNumToRender={4}
          nestedScrollEnabled={true}
          decelerationRate="fast"
          snapToInterval={IMAGE_WIDTH + CARD_GAP}
          contentContainerStyle={{ gap: CARD_GAP, paddingBottom: 8 }}
          ListFooterComponent={<ViewAllButton onPress={handlePressTitle} />}
          ListFooterComponentStyle={styles.dropdownWrap}
          ListEmptyComponent={
            isLoading ? (
              <XStack gap={CARD_GAP}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <CardSkeleton key={idx} width={IMAGE_WIDTH} />
                ))}
              </XStack>
            ) : (
              <Nodata />
            )
          }
        />
      </View>
    </Container>
  );
};

export default HomeAdoptSection;

const Nodata = () => {
  return (
    <YStack gap={20}>
      <NodataWrap>
        <NodataWrapText>[No Data]</NodataWrapText>
      </NodataWrap>
      <NodataText>공고가 없습니다.</NodataText>
    </YStack>
  );
};

const Container = styled(View, {
  bg: '$white900',
  py: 56
});
const TitleContainer = styled(XStack, {
  items: 'center',
  justify: 'space-between',
  mb: 24,
  px: 20
});
const Title = styled(Text, {
  fontSize: 32,
  lineHeight: 40,
  fontWeight: '500',
  color: '$black900'
});
const ButtonGroupWrap = styled(View, {
  mb: 20,
  self: 'baseline',
  width: '100%',
  px: 20
});
const NodataWrap = styled(XStack, {
  width: IMAGE_WIDTH,
  aspectRatio: 5 / 4,
  items: 'center',
  justify: 'center',
  bg: '$backgroundDefault',
  rounded: 8
});
const NodataWrapText = styled(Text, {
  fontSize: 18,
  lineHeight: 20,
  fontWeight: '500',
  color: '$black500'
});
const NodataText = styled(Text, {
  fontSize: 17,
  lineHeight: 19,
  fontWeight: '500',
  color: '$black900'
});
const styles = StyleSheet.create({
  titleWrap: {
    display: 'flex',
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center'
  },
  dropdownWrap: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40
  }
});
