import { useForm } from 'react-hook-form';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { View } from 'tamagui';

import { CREATE_POST_DEFAULT_VALUES, CreatePostForm, TCreatePostDto } from '@/entities';
import { Button, BUTTON_HEIGHT, useLayout } from '@/shared';

export const CreatePost = () => {
  const { bottom } = useLayout();

  const form = useForm<TCreatePostDto>({ defaultValues: CREATE_POST_DEFAULT_VALUES });

  const onSubmit = (data: TCreatePostDto) => {
    // TODO: 실제 제출 로직 구현
    console.log('🔥 / onSubmit / data:', data);
  };

  return (
    <>
      <KeyboardAwareScrollView
        bottomOffset={bottom + BUTTON_HEIGHT.large + 20}
        contentContainerStyle={{
          paddingTop: 40,
          paddingBottom: bottom + BUTTON_HEIGHT.large + 20
        }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <CreatePostForm form={form} />
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>

      <View pb={bottom} position="absolute" b={0} l={0} r={0} px={20} pt={10} bg="$white900">
        <Button onPress={form.handleSubmit(onSubmit)} size="large">
          등록하기
        </Button>
      </View>
    </>
  );
};
