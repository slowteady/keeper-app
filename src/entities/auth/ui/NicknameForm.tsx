import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Spinner, styled, Text, XStack, YStack } from 'tamagui';

import { useCheckNickname } from '@/features/auth';
import { BottomButton, TextInput } from '@/shared/ui';

export interface NicknameFormProps {
  title: string;
  buttonText: string;
  onSubmit: (nickname: string) => void;
  isPending?: boolean;
  initialValue?: string;
}

export const NicknameForm = ({
  title,
  buttonText,
  onSubmit,
  isPending = false,
  initialValue = ''
}: NicknameFormProps) => {
  const { state, flags, actions } = useCheckNickname(initialValue);

  const helperText = flags.isChecking ? (
    <XStack>
      <Spinner size="small" color="$primaryMain" />
    </XStack>
  ) : (
    state.nicknameStatus.message
  );

  const disabled = !flags.isComplete || flags.isChecking || isPending;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <SubContainer>
            <Text fontSize={26} lineHeight={36} fontWeight="600" mb={32}>
              {title}
            </Text>
            <TextInput
              value={state.nickname}
              onChangeText={actions.changeNickname}
              onPressReset={actions.clearNickname}
              placeholder="닉네임을 입력해주세요."
              helperText={helperText}
              helperTextStatus={state.nicknameStatus.status}
              maxLength={8}
            />
          </SubContainer>

          <BottomButton onPress={() => onSubmit(state.nickname)} disabled={disabled} isLoading={isPending}>
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
