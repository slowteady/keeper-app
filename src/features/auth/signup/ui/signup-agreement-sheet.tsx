import { X } from '@tamagui/lucide-icons';
import { Pressable } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button } from '@/shared/ui';

import { AgreementState, SignupAgreement } from './signup-agreement';

export type SignupAgreementSheetProps = {
  nickname: string;
  agreement: AgreementState;
  onAgreementChange: (next: AgreementState) => void;
  onConfirm: () => void;
  onClose: () => void;
  isPending?: boolean;
};

export const SignupAgreementSheet = ({
  nickname,
  agreement,
  onAgreementChange,
  onConfirm,
  onClose,
  isPending
}: SignupAgreementSheetProps) => {
  const { bottom } = useLayout();
  const allAgreed = agreement.age14 && agreement.terms && agreement.privacy;

  return (
    <YStack flex={1} pt={8} testID="signup-agreement-sheet" accessible={false}>
      <CloseButton onPress={onClose} hitSlop={10} testID="signup-agreement-close" accessibilityLabel="닫기">
        <X size={24} color="$black700" />
      </CloseButton>

      <Title>
        <NicknameMark>{nickname}</NicknameMark>님 환영해요!{'\n'}
        시작 전 약관 동의가 필요해요
      </Title>

      <SignupAgreement value={agreement} onChange={onAgreementChange} />

      <View position="absolute" b={bottom || 16} l={0} r={0}>
        <Button
          size="large"
          style={{ borderRadius: 10 }}
          onPress={onConfirm}
          disabled={!allAgreed || isPending}
          isLoading={isPending}
          testID="signup-agreement-confirm"
        >
          동의하고 시작하기
        </Button>
      </View>
    </YStack>
  );
};

const CloseButton = styled(Pressable, {
  position: 'absolute',
  t: 0,
  r: 0,
  p: 4
});

const Title = styled(Text, {
  mt: 8,
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});

const NicknameMark = styled(Text, {
  color: '$primaryMain',
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700'
});
