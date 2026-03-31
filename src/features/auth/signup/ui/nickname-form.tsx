import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Spinner, styled, Text, XStack, YStack } from 'tamagui';

import { BottomButton, TextInput } from '@/shared/ui';

import { useCheckNickname } from '../model/use-check-nickname';

export type NicknameFormProps = {
  title: string;
  buttonText: string;
  onSubmit: (nickname: string) => void;
  isPending?: boolean;
  initialValue?: string;
};

export const NicknameForm = ({
  title,
  buttonText,
  onSubmit,
  isPending = false,
  initialValue = ''
}: NicknameFormProps) => {
  const { nickname, nicknameStatus, isChecking, isComplete, changeNickname, clearNickname } =
    useCheckNickname(initialValue);

  const helperText = isChecking ? (
    <XStack>
      <Spinner size="small" color="$primaryMain" />
    </XStack>
  ) : (
    nicknameStatus.message
  );

  const disabled = !isComplete || isChecking || isPending;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <SubContainer>
            <Text fontSize={26} lineHeight={36} fontWeight="600" mb={32}>
              {title}
            </Text>
            <TextInput
              value={nickname}
              onChangeText={changeNickname}
              onPressReset={clearNickname}
              placeholder="닉네임을 입력해주세요."
              helperText={helperText}
              helperTextStatus={nicknameStatus.status}
              maxLength={8}
            />
          </SubContainer>

          <BottomButton onPress={() => onSubmit(nickname)} disabled={disabled} isLoading={isPending}>
            <Text fontSize={15} fontWeight={600} lineHeight={18} color={disabled ? '$black500' : '$black900'}>
              {buttonText}
            </Text>
          </BottomButton>
        </Container>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});

const SubContainer = styled(YStack, {
  flex: 1,
  px: 20,
  pt: 48
});
