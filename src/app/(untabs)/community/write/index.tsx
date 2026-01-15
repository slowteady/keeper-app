import { useState } from 'react';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { LocationBottomSheet, useLocationBottomSheet } from '@/features/address';
import { useCreatePost } from '@/features/community';
import { useLayout } from '@/shared/model';
import { Button } from '@/shared/ui';
import { CommunityAdoptForm } from '@/widgets/community-adopt-feed-section';

const Page = () => {
  const { bottom } = useLayout();
  const [buttonHeight, setButtonHeight] = useState(0);

  const { form, actions } = useCreatePost();

  const locationBottomSheet = useLocationBottomSheet((selectedAddress) => {
    form.setValue('location', selectedAddress.address.address_name);
  });

  return (
    <Container>
      <KeyboardAwareScrollView contentContainerStyle={{ paddingVertical: 40 }} bottomOffset={buttonHeight}>
        <CommunityAdoptForm
          form={form}
          onPressWeight={actions.openWeightSelector}
          onPressAge={actions.openAgeSelector}
          onPressKind={actions.openKindSelector}
          onPressLocation={locationBottomSheet.actions.openBottomSheet}
        />
      </KeyboardAwareScrollView>

      <KeyboardStickyView onLayout={(e) => setButtonHeight(e.nativeEvent.layout.height)}>
        <StickyButtonWrapper pb={bottom}>
          <Button size="large" style={{ borderRadius: 10 }} onPress={form.handleSubmit(actions.handleSubmit)}>
            등록하기
          </Button>
        </StickyButtonWrapper>
      </KeyboardStickyView>

      <LocationBottomSheet
        ref={locationBottomSheet.refs.ref}
        addresses={locationBottomSheet.state.searchedAddresses || []}
        onDismiss={locationBottomSheet.actions.dismiss}
        onSearch={locationBottomSheet.actions.submitGeocode}
        onSelectAddress={locationBottomSheet.actions.getAddress}
        isPending={locationBottomSheet.flags.isPending}
      />
    </Container>
  );
};

export default Page;

const Container = styled(View, {
  bg: '$pageBackground',
  flex: 1
});

const StickyButtonWrapper = styled(View, {
  px: 20,
  pt: 10,
  bg: '$white900'
});
