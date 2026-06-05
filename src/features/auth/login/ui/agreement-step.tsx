import { styled, Text, YStack } from 'tamagui';

import type { AgreementState } from '../../signup/ui';
import { SignupAgreement } from '../../signup/ui';
import type { PolicyType } from '../model/use-login-sheet';

type AgreementStepProps = {
  agreements: AgreementState;
  onChange: (next: AgreementState) => void;
  onViewPolicy: (type: PolicyType) => void;
};

export const AgreementStep = ({ agreements, onChange, onViewPolicy }: AgreementStepProps) => (
  <YStack pt={8} pb={12}>
    <Title>환영해요!{'\n'}시작 전 약관 동의가 필요해요</Title>

    <SignupAgreement
      value={agreements}
      onChange={onChange}
      marginTop={20}
      onViewTerms={() => onViewPolicy('terms')}
      onViewPrivacy={() => onViewPolicy('privacy')}
      onViewCommunity={() => onViewPolicy('community')}
    />
  </YStack>
);

const Title = styled(Text, {
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});
