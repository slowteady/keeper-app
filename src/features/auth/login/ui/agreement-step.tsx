import { styled, Text, View, YStack } from 'tamagui';

import { Button } from '@/shared/ui';

import type { AgreementState } from '../../signup/ui';
import { SignupAgreement } from '../../signup/ui';
import type { PolicyType } from '../model/use-login-sheet';

type AgreementStepProps = {
  agreements: AgreementState;
  onChange: (next: AgreementState) => void;
  allRequiredAgreed: boolean;
  onSubmit: () => void;
  onViewPolicy: (type: PolicyType) => void;
  isPending?: boolean;
};

export const AgreementStep = ({
  agreements,
  onChange,
  allRequiredAgreed,
  onSubmit,
  onViewPolicy,
  isPending
}: AgreementStepProps) => (
  <YStack px={20} pt={8} pb={12} gap={20}>
    <Title>환영해요!{'\n'}시작 전 약관 동의가 필요해요</Title>

    <SignupAgreement
      value={agreements}
      onChange={onChange}
      onViewTerms={() => onViewPolicy('terms')}
      onViewPrivacy={() => onViewPolicy('privacy')}
      onViewCommunity={() => onViewPolicy('community')}
    />

    <View>
      <Button
        size="large"
        style={{ borderRadius: 10 }}
        onPress={onSubmit}
        disabled={!allRequiredAgreed || isPending}
        isLoading={isPending}
        testID="login-agreement-confirm"
      >
        동의하고 시작하기
      </Button>
    </View>
  </YStack>
);

const Title = styled(Text, {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});
