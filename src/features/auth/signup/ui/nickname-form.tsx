import { ReactNode } from 'react';
import { Spinner, styled, Text, XStack } from 'tamagui';

import { useCheckNickname } from '@/features/auth/check-nickname';
import { BottomButton, FormLayout, TextInput } from '@/shared/ui';

export type NicknameFormProps = {
  title: string;
  buttonText: string;
  onSubmit: (nickname: string) => void;
  isPending?: boolean;
  initialValue?: string;
  extraDisabled?: boolean;
  children?: ReactNode;
};

export const NicknameForm = ({
  title,
  buttonText,
  onSubmit,
  isPending = false,
  initialValue = '',
  extraDisabled = false,
  children
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

  const disabled = !isComplete || isChecking || isPending || extraDisabled;

  return (
    <FormLayout
      containerProps={{ bg: '$pageBackground' }}
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 48 }}
      footer={
        <BottomButton onPress={() => onSubmit(nickname)} disabled={disabled} isLoading={isPending}>
          <Text fontSize={15} fontWeight={600} lineHeight={18} color={disabled ? '$black500' : '$black900'}>
            {buttonText}
          </Text>
        </BottomButton>
      }
    >
      <Title>{title}</Title>
      <TextInput
        value={nickname}
        onChangeText={changeNickname}
        onPressReset={clearNickname}
        placeholder="닉네임"
        helperText={helperText}
        helperTextStatus={nicknameStatus.status}
        maxLength={10}
      />
      {children}
    </FormLayout>
  );
};

const Title = styled(Text, {
  fontSize: 26,
  lineHeight: 36,
  fontWeight: '600',
  mb: 32
});
