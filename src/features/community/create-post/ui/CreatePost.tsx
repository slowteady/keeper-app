import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView, KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { Button, BUTTON_HEIGHT, useLayout } from '@/shared';

import { useCreatePost } from '../model';
import { CreatePostForm } from './CreatePostForm';

export const CreatePost = () => {
  const { bottom } = useLayout();

  const { form, actions } = useCreatePost();

  return (
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
              onPressWeight={actions.handlePressWeight}
              onPressAge={actions.handlePressAge}
              onPressKind={actions.handlePressKind}
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
  );
};

const Container = styled(View, {
  position: 'relative',
  flex: 1
});
