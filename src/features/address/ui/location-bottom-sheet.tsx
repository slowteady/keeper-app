import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { forwardRef, useCallback, useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { BottomSheet } from '@/shared/ui';

import { KakaoAddressDocumentDto } from '../model';
import { BottomSheetSearchInput } from './bottom-sheet-search-input';

export type LocationBottomSheetProps = {
  addresses?: KakaoAddressDocumentDto[];
  onDismiss: () => void;
  onSearch: (text: string) => void;
  onSelectAddress: (address: KakaoAddressDocumentDto) => void;
  isPending: boolean;
};

export const LocationBottomSheet = forwardRef<BottomSheetModal, LocationBottomSheetProps>((props, ref) => {
  const { addresses, onDismiss, onSearch, onSelectAddress, isPending } = props;
  const snapPoints = useMemo(() => ['50%'], []);

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<KakaoAddressDocumentDto>) => {
      const { address_name } = item;

      return (
        <ListButton onPress={() => onSelectAddress(item)}>
          <ListText>{address_name}</ListText>
        </ListButton>
      );
    },
    [onSelectAddress]
  );

  return (
    <BottomSheet
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={onDismiss}
      snapPoints={snapPoints}
      ref={ref}
    >
      <View py={10}>
        <HeaderText>주소검색</HeaderText>
        <BottomSheetSearchInput onSubmit={onSearch} placeholder="예)강남구" />
      </View>

      {isPending ? (
        <IndicatorContainer>
          <ActivityIndicator size="large" />
        </IndicatorContainer>
      ) : (
        <FlashList
          data={addresses || []}
          keyExtractor={({ address_name }, idx) => `${address_name}-${idx}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator
          ListEmptyComponent={
            <NodataContainer>
              {addresses === undefined ? (
                <NodataText>주소를 검색해주세요</NodataText>
              ) : (
                <NodataText>검색 결과가 없습니다</NodataText>
              )}
            </NodataContainer>
          }
          style={{ marginBottom: 48 }}
        />
      )}
    </BottomSheet>
  );
});

const IndicatorContainer = styled(XStack, {
  flex: 1,
  items: 'center',
  justify: 'center'
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
  p: 16,
  borderBottomWidth: 1,
  borderBottomColor: '$white800'
});

const ListText = styled(Text, {
  fontSize: 16,
  lineHeight: 18,
  color: '$black800'
});

const HeaderText = styled(Text, {
  fontSize: 20,
  fontWeight: '600',
  lineHeight: 22,
  color: '$black800',
  mb: 18
});

LocationBottomSheet.displayName = 'LocationBottomSheet';
