import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { styled, View } from 'tamagui';

import { CreatePost } from '@/features';
import { BUTTON_HEIGHT, useLayout } from '@/shared';

export const PostEditor = () => {
  const { bottom } = useLayout();

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={bottom + BUTTON_HEIGHT.large} style={{ flex: 1 }}>
      <Container>
        <CreatePost />
      </Container>
    </KeyboardAvoidingView>
  );
};

const Container = styled(View, {
  position: 'relative',
  flex: 1
});
