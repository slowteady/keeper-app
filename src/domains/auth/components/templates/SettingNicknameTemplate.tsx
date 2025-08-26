import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spinner, styled, Text, XStack, YStack } from 'tamagui';

import { SignupForm } from '@/app/login/signup';
import { KeyboardView, TextField } from '@/shared/components';
import { Button } from '@/shared/components/_atoms/Button';
import { useDebounceValue } from '@/shared/hooks/useDebounce';

import { useCheckNicknameMutation } from '../../services';

export interface SettingNicknameTemplateProps {
  onSubmit: (values: SignupForm) => void;
  isPending?: boolean;
}
type NicknameStatus = {
  status: 'default' | 'success' | 'error';
  message: string;
};
export const SettingNicknameTemplate = ({ onSubmit, isPending = false }: SettingNicknameTemplateProps) => {
  const [isComplete, setIsComplete] = useState(false);
  const [nicknameState, setNicknameState] = useState<NicknameStatus>({
    status: 'default',
    message: '*기호, 특수문자 제외 8자 가능'
  });

  const { setValue, handleSubmit } = useFormContext<SignupForm>();
  const nickname = useWatch({ name: 'nickname' });
  const { bottom } = useSafeAreaInsets();
  const debouncedNickname = useDebounceValue(nickname, 1000);

  const { mutate: nicknameCheckMutate, isPending: isNicknameCheckPending } = useCheckNicknameMutation();

  const handleChangeNickname = (text: string) => {
    const filtered = text.replace(/[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/g, '');
    setValue('nickname', filtered);

    if (nicknameState.status !== 'default' || debouncedNickname === '') {
      setNicknameState({
        status: 'default',
        message: '*기호, 특수문자 제외 8자 가능'
      });
    }

    setIsComplete(false);
  };

  useEffect(() => {
    if (debouncedNickname === '') return;

    nicknameCheckMutate(
      { nickname: debouncedNickname },
      {
        onSuccess: (response) => {
          const isDuplicated = response.data.data;

          if (isDuplicated) {
            setIsComplete(false);
            setNicknameState({
              status: 'error',
              message: '*사용할 수 없는 닉네임입니다.'
            });
          } else {
            setNicknameState({
              status: 'success',
              message: '*사용 가능한 닉네임입니다.'
            });

            setIsComplete(true);
          }
        }
      }
    );
  }, [debouncedNickname, nicknameCheckMutate]);

  const helperText = isNicknameCheckPending ? (
    <XStack mt="$3">
      <Spinner size="small" color="$primaryMain" />
    </XStack>
  ) : (
    nicknameState.message
  );

  return (
    <KeyboardView>
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
            />
          </SubContainer>

          <Button disabled={!isComplete || isPending} onPress={handleSubmit(onSubmit)} isLoading={isPending}>
            등록하기
          </Button>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardView>
  );
};

const Container = styled(YStack, {
  flex: 1,
  px: '$5',
  bg: '$backgroundDefault'
});
const SubContainer = styled(YStack, {
  flex: 1,
  pt: '$8'
});
const Title = styled(Text, {
  fontSize: 26,
  lineHeight: 36,
  fontWeight: '$6',
  mb: '$8'
});
const CustomTextField = styled(TextField, {
  size: '$4',
  placeholderTextColor: '$black500',
  fontWeight: '$4',
  fontSize: 15,
  rounded: '$3'
});
