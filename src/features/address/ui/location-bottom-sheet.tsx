import { BottomSheetFlatList, BottomSheetModal } from '@gorhom/bottom-sheet';
import { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator, Keyboard, ListRenderItemInfo } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { BottomSheet } from '@/shared/ui';

import { KakaoKeywordDocumentDto } from '../model';
import { BottomSheetSearchInput } from './bottom-sheet-search-input';

export type LocationBottomSheetProps = {
  results?: KakaoKeywordDocumentDto[];
  query: string;
  onChangeText: (text: string) => void;
  onDismiss: () => void;
  onSelectAddress: (item: KakaoKeywordDocumentDto) => void;
  isPending: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
};

const HighlightText = ({
  text,
  query,
  color,
  fontSize
}: {
  text: string;
  query: string;
  color: '$black800' | '$black500';
  fontSize: number;
}) => {
  const keyword = query.trim();
  if (keyword.length === 0 || !text.includes(keyword)) {
    return (
      <Text fontSize={fontSize} lineHeight={fontSize + 4} color={color}>
        {text}
      </Text>
    );
  }

  const parts = text.split(keyword);

  return (
    <Text fontSize={fontSize} lineHeight={fontSize + 4} color={color}>
      {parts.map((part, idx) => (
        <Text key={idx} fontSize={fontSize} lineHeight={fontSize + 4} color={color}>
          {part}
          {idx < parts.length - 1 && (
            <Text fontSize={fontSize} lineHeight={fontSize + 4} fontWeight="700" color="$primaryDark">
              {keyword}
            </Text>
          )}
        </Text>
      ))}
    </Text>
  );
};

export const LocationBottomSheet = forwardRef<BottomSheetModal, LocationBottomSheetProps>((props, ref) => {
  const {
    results,
    query,
    onChangeText,
    onDismiss,
    onSelectAddress,
    isPending,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage
  } = props;
  const snapPoints = useMemo(() => ['60%'], []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<KakaoKeywordDocumentDto>) => (
      <ListButton onPress={() => onSelectAddress(item)}>
        <HighlightText text={item.place_name} query={query} color="$black800" fontSize={16} />
        <Text fontSize={13} lineHeight={17} color="$black500">
          {item.address_name || item.road_address_name}
        </Text>
      </ListButton>
    ),
    [onSelectAddress, query]
  );

  return (
    <BottomSheet
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      snapPoints={snapPoints}
      ref={ref}
      disableViewWrap
    >
      <Header onPress={() => Keyboard.dismiss()}>
        <HeaderText>장소검색</HeaderText>
        <BottomSheetSearchInput onChangeText={onChangeText} placeholder="예)강남구, 건대입구역" />
      </Header>

      <BottomSheetFlatList
        data={results || []}
        keyExtractor={(item: KakaoKeywordDocumentDto) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator
        keyboardShouldPersistTaps="handled"
        onEndReached={hasNextPage ? fetchNextPage : undefined}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View py={16} items="center">
              <ActivityIndicator />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <NodataContainer>
            {results === undefined ? (
              isPending ? (
                <ActivityIndicator size="large" />
              ) : (
                <NodataText>장소를 검색해주세요</NodataText>
              )
            ) : (
              <NodataText>검색 결과가 없어요</NodataText>
            )}
          </NodataContainer>
        }
        contentContainerStyle={{ paddingBottom: 48 }}
      />
    </BottomSheet>
  );
});

const Header = styled(View, {
  pt: 12,
  pb: 10
});

const NodataContainer = styled(XStack, {
  items: 'center',
  justify: 'center',
  height: 200
});

const NodataText = styled(Text, {
  fontSize: 16,
  fontWeight: '400',
  lineHeight: 18,
  color: '$black500',
  mb: 48
});

const ListButton = styled(View, {
  py: 16,
  gap: 4,
  borderBottomWidth: 1,
  borderBottomColor: '$white800'
});

const HeaderText = styled(Text, {
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 22,
  color: '$black800',
  mb: 18
});

LocationBottomSheet.displayName = 'LocationBottomSheet';
