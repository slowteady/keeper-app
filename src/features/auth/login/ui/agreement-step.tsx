import { styled, Text, View, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button } from '@/shared/ui';

import type { AgreementState } from '../../signup/ui';
import { SignupAgreement } from '../../signup/ui';
import type { PolicyType } from '../model/use-login-sheet';

type AgreementStepProps = {
  agreements: AgreementState;
  onChange: (next: AgreementState) => void;
  onViewPolicy: (type: PolicyType) => void;
  allRequiredAgreed: boolean;
  onSubmit: () => void;
  isPending?: boolean;
};

export const AgreementStep = ({
  agreements,
  onChange,
  onViewPolicy,
  allRequiredAgreed,
  onSubmit,
  isPending
}: AgreementStepProps) => {
  const { bottom } = useLayout();

  return (
    <YStack pt={8} pb={bottom + 12}>
      <Title>환영해요!{'\n'}시작 전 약관 동의가 필요해요</Title>

      <SignupAgreement
        value={agreements}
        onChange={onChange}
        marginTop={20}
        onViewTerms={() => onViewPolicy('terms')}
        onViewPrivacy={() => onViewPolicy('privacy')}
        onViewCommunity={() => onViewPolicy('community')}
      />

      <View mt={24}>
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
};

const Title = styled(Text, {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});
