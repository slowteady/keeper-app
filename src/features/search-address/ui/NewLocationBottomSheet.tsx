import { FlashList, ListRenderItemInfo } from '@shopify/flash-list';
import { useMemo } from 'react';
import { ActivityIndicator } from 'react-native';
import { styled, Text, View, XStack } from 'tamagui';

import { BottomSheet } from '@/shared';

import { KakaoAddressDocumentDto, useLocationBottomSheet } from '../model';
import { BottomSheetSearchbar } from './BottomSheetSearchbar';

export interface NewLocationBottomSheetProps {
  vm: ReturnType<typeof useLocationBottomSheet>;
}

export const NewLocationBottomSheet = ({ vm }: NewLocationBottomSheetProps) => {
  const snapPoints = useMemo(() => [500], []);

  const { state, actions, ref } = vm;

  const renderItem = ({ item }: ListRenderItemInfo<KakaoAddressDocumentDto>) => {
    const { address_name } = item;

    return (
      <ListButton onPress={() => actions.getAddress(item)}>
        <ListText>{address_name}</ListText>
      </ListButton>
    );
  };

  return (
    <BottomSheet
      android_keyboardInputMode="adjustResize"
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      onDismiss={actions.dismiss}
      snapPoints={snapPoints}
      ref={ref}
    >
      <View py={10}>
        <HeaderText>주소검색</HeaderText>
        <BottomSheetSearchbar onSubmit={actions.submitGeocode} placeholder="예)강남구" />
      </View>

      {state.isPending ? (
        <IndicatorContainer>
          <ActivityIndicator size="large" />
        </IndicatorContainer>
      ) : (
        <FlashList
          data={state.searchedAddresses}
          keyExtractor={({ address_name }, idx) => `${address_name}-${idx}`}
          renderItem={renderItem}
          showsVerticalScrollIndicator
          ListEmptyComponent={
            state.searchedAddresses ? (
              <NodataContainer>
                <NodataText>검색 결과가 없습니다.</NodataText>
              </NodataContainer>
            ) : null
          }
          style={{ marginBottom: 48 }}
        />
      )}
    </BottomSheet>
  );
};

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
  fontSize: 15,
  fontWeight: '400',
  lineHeight: 17,
  color: '$black500'
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
