import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { LocationBottomSheet, useLocationBottomSheet } from '@/features/search-address';
import { Button, BUTTON_HEIGHT, useLayout } from '@/shared';

import { useCreatePost } from '../model';
import { CreatePostForm } from './CreatePostForm';

export const CreatePost = () => {
  const { bottom } = useLayout();

  const { form, actions } = useCreatePost();

  const locationBottomSheet = useLocationBottomSheet((selectedAddress) => {
    form.setValue('location', selectedAddress.address.address_name);
  });

  return (
    <>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={bottom + BUTTON_HEIGHT.large + 20}
        style={{ flex: 1 }}
      >
        <Container>
          <KeyboardAwareScrollView
            bottomOffset={bottom + BUTTON_HEIGHT.large + 20}
            contentContainerStyle={{
              paddingTop: 40,
              paddingBottom: bottom + BUTTON_HEIGHT.large + 20
            }}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <CreatePostForm
                form={form}
                onPressWeight={actions.openWeightSelector}
                onPressAge={actions.openAgeSelector}
                onPressKind={actions.openKindSelector}
                onPressLocation={locationBottomSheet.actions.openBottomSheet}
              />
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>

          <View pb={bottom} position="absolute" b={0} l={0} r={0} px={20} pt={10} bg="$white900">
            <Button onPress={form.handleSubmit(actions.handleSubmit)} size="large">
              등록하기
            </Button>
          </View>
        </Container>
      </KeyboardAvoidingView>

      <LocationBottomSheet
        ref={locationBottomSheet.refs.ref}
        addresses={locationBottomSheet.state.searchedAddresses || []}
        onDismiss={locationBottomSheet.actions.dismiss}
        onSearch={locationBottomSheet.actions.submitGeocode}
        onSelectAddress={locationBottomSheet.actions.getAddress}
        isPending={locationBottomSheet.flags.isPending}
      />
    </>
  );
};

const Container = styled(View, {
  position: 'relative',
  flex: 1
});
