import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Spinner, styled, Text, XStack, YStack } from 'tamagui';

import { SignupForm } from '@/app/(home)/(public)/signup';
import { Button, BUTTON_HEIGHT, TextField, useDebounceValue, useLayout } from '@/shared';

import { useCheckNicknameMutation } from '../../services';

export interface SettingNicknameTemplateProps {
  onSubmit: (values: SignupForm) => void;
}
type NicknameStatus = {
  status: 'default' | 'success' | 'error';
  message: string;
};
export const SettingNicknameTemplate = ({ onSubmit }: SettingNicknameTemplateProps) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [nicknameState, setNicknameState] = useState<NicknameStatus>({
    status: 'default',
    message: '*기호, 특수문자 제외 8자 가능'
  });

  const { setValue, handleSubmit } = useFormContext<SignupForm>();
  const nickname = useWatch({ name: 'nickname' });
  const { bottom } = useLayout();

  const debouncedNickname = useDebounceValue(nickname, 1000);

  const { mutate: nicknameCheckMutate } = useCheckNicknameMutation();

  const handleChangeNickname = (text: string) => {
    const filtered = text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
    setValue('nickname', filtered);

    setIsChecking(true);

    if (nicknameState.status !== 'default' || debouncedNickname === '') {
      setNicknameState({
        status: 'default',
        message: '*기호, 특수문자 제외 8자 가능'
      });
    }

    setIsComplete(false);
  };

  useEffect(() => {
    if (debouncedNickname === '') {
      setIsChecking(false);
      return;
    }

    nicknameCheckMutate(
      { nickname: debouncedNickname },
      {
        onSuccess: (response) => {
          const isDuplicated = response.data.data;

          if (isDuplicated) {
            setIsComplete(false);
            setNicknameState({
              status: 'error',
              message: '*사용할 수 없는 닉네임이에요.'
            });
          } else {
            setNicknameState({
              status: 'success',
              message: '*사용가능한 닉네임이예요.'
            });

            setIsComplete(true);
          }
        },
        onSettled: () => {
          setIsChecking(false);
        }
      }
    );
  }, [debouncedNickname, nicknameCheckMutate]);

  const helperText = isChecking ? (
    <XStack mt="$3">
      <Spinner size="small" color="$primaryMain" />
    </XStack>
  ) : (
    nicknameState.message
  );

  return (
    <KeyboardAvoidingView behavior="padding" keyboardVerticalOffset={bottom + BUTTON_HEIGHT.small} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container pb={bottom}>
          <SubContainer>
            <Title>{'어떤 닉네임으로\n불러드릴까요?'}</Title>
            <CustomTextField
              value={nickname}
              placeholder="닉네임"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              returnKeyLabel="완료"
              status={nicknameState.status}
              helperText={helperText}
              maxLength={8}
              onChangeText={handleChangeNickname}
              onPressReset={() => setValue('nickname', '')}
            />
          </SubContainer>

          <Button disabled={!isComplete || isChecking} onPress={handleSubmit(onSubmit)} isLoading={isChecking}>
            등록하기
          </Button>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const Container = styled(YStack, {
  flex: 1,
  px: '$5',
  bg: '$pageBackground'
});
const SubContainer = styled(YStack, {
  flex: 1,
  pt: 48
});
const Title = styled(Text, {
  fontSize: 26,
  lineHeight: 36,
  fontWeight: '$6',
  mb: 32
});
const CustomTextField = styled(TextField, {
  placeholderTextColor: '$black500',
  fontWeight: '$4',
  fontSize: 15,
  rounded: '$3',
  variant: 'fill'
});
