import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useCallback, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { styled, Text, useTheme, View, XStack } from 'tamagui';

import { KakaoKeywordDocumentDto, useKeywordSearch } from '@/features/address';
import { SearchInput } from '@/shared/ui';
import { LeftLineArrow } from '@/shared/ui/icons/mini';

type ShelterSearchScreenProps = {
  onClose: () => void;
  onSelect: (coord: { latitude: number; longitude: number }) => void;
};

export const ShelterSearchScreen = ({ onClose, onSelect }: ShelterSearchScreenProps) => {
  const insets = useSafeAreaInsets();
  const { black900 } = useTheme();
  const [value, setValue] = useState('');
  const { results, isPending, isFetchingNextPage, hasNextPage, fetchNextPage, setKeyword } = useKeywordSearch();

  const handleChangeText = useCallback(
    (text: string) => {
      setValue(text);
      setKeyword(text);
    },
    [setKeyword]
  );

  const handleSelect = useCallback(
    (item: KakaoKeywordDocumentDto) => {
      onSelect({ latitude: Number(item.y), longitude: Number(item.x) });
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<KakaoKeywordDocumentDto>) => (
      <ListButton onPress={() => handleSelect(item)}>
        <PlaceName>{item.place_name}</PlaceName>
        <AddressName>{item.road_address_name || item.address_name}</AddressName>
      </ListButton>
    ),
    [handleSelect]
  );

  return (
    <Container style={{ paddingTop: insets.top }}>
      <HeaderRow>
        <View onPress={onClose} hitSlop={10}>
          <LeftLineArrow width={24} height={30} color={black900.val} />
        </View>
        <View flex={1}>
          <SearchInput autoFocus value={value} placeholder="지역·주소·장소로 검색" onTextChange={handleChangeText} />
        </View>
      </HeaderRow>

      {isPending ? (
        <IndicatorContainer>
          <ActivityIndicator size="large" />
        </IndicatorContainer>
      ) : (
        <FlashList
          data={results ?? []}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          onEndReached={hasNextPage ? fetchNextPage : undefined}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          style={{ flex: 1 }}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View py={20} items="center">
                <ActivityIndicator />
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyContainer>
              <EmptyText>{results === undefined ? '지역·주소·장소를 검색해보세요' : '검색 결과가 없어요'}</EmptyText>
            </EmptyContainer>
          }
        />
      )}
    </Container>
  );
};

const Container = styled(View, {
  flex: 1,
  bg: '$pageBackground'
});

const HeaderRow = styled(XStack, {
  items: 'center',
  gap: 12,
  px: 20,
  py: 12
});

const IndicatorContainer = styled(XStack, {
  flex: 1,
  items: 'center',
  justify: 'center'
});

const EmptyContainer = styled(XStack, {
  items: 'center',
  justify: 'center',
  height: 200
});

const EmptyText = styled(Text, {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 18,
  color: '$black500'
});

const ListButton = styled(View, {
  px: 16,
  py: 14,
  gap: 4,
  borderBottomWidth: 1,
  borderBottomColor: '$white800'
});

const PlaceName = styled(Text, {
  fontSize: 16,
  lineHeight: 20,
  fontWeight: '500',
  color: '$black800'
});

const AddressName = styled(Text, {
  fontSize: 13,
  lineHeight: 16,
  color: '$black500'
});
