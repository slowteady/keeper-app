import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { Spinner, styled, Text, XStack, YStack } from 'tamagui';

import { useCheckNickname, useSignup } from '@/features/auth';
import { BottomButton, CancelModal, TextInput } from '@/shared/ui';

const Page = () => {
  const { actions: signupActions, flags: signupFlags } = useSignup();
  const { state: nicknameState, flags: nicknameFlags, actions: nicknameActions } = useCheckNickname();

  const helperText = nicknameFlags.isChecking ? (
    <XStack>
      <Spinner size="small" color="$primaryMain" />
    </XStack>
  ) : (
    nicknameState.nicknameStatus.message
  );

  const disabled = !nicknameFlags.isComplete || nicknameFlags.isChecking || signupFlags.isPending;

  return (
    <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Container>
          <SubContainer>
            <Text fontSize={26} lineHeight={36} fontWeight="600" mb={32}>
              {'어떤 닉네임으로\n불러드릴까요?'}
            </Text>
            <TextInput
              value={nicknameState.nickname}
              onChangeText={nicknameActions.changeNickname}
              onPressReset={nicknameActions.clearNickname}
              placeholder="닉네임을 입력해주세요."
              helperText={helperText}
              helperTextStatus={nicknameState.nicknameStatus.status}
              maxLength={8}
            />
          </SubContainer>

          <BottomButton
            onPress={() => signupActions.executeSignup(nicknameState.nickname)}
            disabled={disabled}
            isLoading={signupFlags.isPending}
          >
            <Text fontSize={15} fontWeight={600} lineHeight={18} color={disabled ? '$black500' : '$black900'}>
              등록하기
            </Text>
          </BottomButton>
        </Container>
      </TouchableWithoutFeedback>

      <CancelModal
        open={signupFlags.showCancelModal}
        onClose={signupActions.closeModal}
        onConfirm={signupActions.executeCancel}
        description="지금 나가시면 회원가입이 완료되지 않아요."
      />
    </KeyboardAvoidingView>
  );
};

export default Page;

const Container = styled(YStack, {
  flex: 1,
  bg: '$pageBackground'
});

const SubContainer = styled(YStack, {
  flex: 1,
  px: 20,
  pt: 48
});
