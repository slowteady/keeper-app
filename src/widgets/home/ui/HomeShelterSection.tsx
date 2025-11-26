import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { router } from 'expo-router';
import { useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { DistanceIndicator, HOME_SHELTER_CARD_SIZE, HomeShelterCard, ShelterDto, ShelterMap } from '@/entities';
import { useHomeShelterSection } from '@/features';
import { Skeleton, ViewAllButton } from '@/shared';
import { DownArrow } from '@/shared/ui/icons/mini';

const SHELTER_CARD_MIN_HEIGHT = 144;

export const HomeShelterSection = () => {
  const { data, refs, state, actions, flags, styles } = useHomeShelterSection();

  const { black500 } = useTheme();

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ShelterDto>) => {
    return (
      <View onPress={() => router.push({ pathname: '/shelter/[id]', params: { id: item.id } })}>
        <HomeShelterCard name={item.name} address={item.address} tel={item.tel} />
      </View>
    );
  }, []);

  return (
    <>
      <HeaderContainer px={20} mb={16}>
        <Text fontSize={26} lineHeight={36} fontWeight="600" color="$black900">
          보호소 찾기
        </Text>
        <XStack items="center" gap={2} mt={12} onPress={() => router.push('/shelter')}>
          <Text fontSize={15} lineHeight={21} fontWeight="500" color="$black500">
            전체보기
          </Text>
          <DownArrow width={10} height={6} color={black500.val} transform={[{ rotate: '-90deg' }]} />
        </XStack>
      </HeaderContainer>

      {flags.hasLocationStatus && (
        <View px={20} mb={16}>
          <DistanceIndicator value={data.shelterCounts ?? []} />
        </View>
      )}

      <View px={20} mb={16}>
        <ShelterMap
          data={data.shelters}
          ref={refs.mapRef}
          camera={state.camera}
          selectedMarkerId={state.selectedMarkerId}
          onInitialized={actions.toggleMapEnabled}
          onRefetch={actions.refetchShelterList}
          onTapMarker={actions.toggleTapMarker}
          hasLocation={flags.hasLocationStatus}
          isShowCompass={false}
          minZoom={10}
        />
      </View>

      <Animated.View style={styles.animatedListStyle}>
        <FlashList
          keyExtractor={({ id }, i) => `${id}-${i}`}
          data={data.shelters}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View width={12} />}
          ListEmptyComponent={<EmptyComponent isLoading={flags.isLoading} />}
          ListFooterComponent={() => <ViewAllButton onPress={() => router.push('/shelter')} />}
          ListFooterComponentStyle={{ alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}
          style={{ paddingLeft: 20, minHeight: SHELTER_CARD_MIN_HEIGHT }}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          horizontal
        />
      </Animated.View>
    </>
  );
};

const EmptyComponent = ({ isLoading }: { isLoading: boolean }) => {
  return isLoading ? (
    <XStack gap={16}>
      {Array.from({ length: 2 }).map((_, idx) => (
        <View
          key={`home-shelter-card-skeleton-${idx}`}
          width={HOME_SHELTER_CARD_SIZE.SMALL}
          height={SHELTER_CARD_MIN_HEIGHT}
        >
          <Skeleton style={{ width: '100%', height: '100%', borderRadius: 12 }} />
        </View>
      ))}
    </XStack>
  ) : (
    <NodataContainer>
      <Text fontSize={14} lineHeight={16} fontWeight="500" color="$black500">
        가까운 곳에 보호소가 없습니다.
      </Text>
    </NodataContainer>
  );
};

const HeaderContainer = styled(XStack, {
  justify: 'space-between',
  items: 'center'
});

const NodataContainer = styled(XStack, {
  width: HOME_SHELTER_CARD_SIZE.SMALL,
  bg: '$white900',
  items: 'center',
  justify: 'center',
  borderColor: '$white800',
  borderWidth: 1,
  rounded: 12
});
