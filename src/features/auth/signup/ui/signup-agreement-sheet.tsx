import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { styled, Text, View, XStack, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button, useBottomSheet } from '@/shared/ui';

import { AgreementState, SignupAgreement } from './signup-agreement';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = WINDOW_HEIGHT * 0.55;

const INITIAL_AGREEMENT: AgreementState = { age14: false, terms: false, privacy: false, community: false };

export type SignupAgreementSheetProps = {
  onConfirm: (agreement: AgreementState) => void;
  onClose: () => void;
  isPending?: boolean;
};

export const SignupAgreementSheet = ({ onConfirm, onClose, isPending }: SignupAgreementSheetProps) => {
  const { bottom } = useLayout();
  const { setFooter } = useBottomSheet();
  const [agreement, setAgreement] = useState<AgreementState>(INITIAL_AGREEMENT);
  const allAgreed = agreement.age14 && agreement.terms && agreement.privacy;

  useEffect(() => {
    setFooter(() => (
      <AgreementFooter
        bottom={bottom}
        allAgreed={allAgreed}
        isPending={isPending}
        onClose={onClose}
        onConfirm={() => onConfirm(agreement)}
      />
    ));
    return () => setFooter(undefined);
  }, [agreement, allAgreed, isPending, onClose, onConfirm, bottom, setFooter]);

  return (
    <YStack height={SHEET_HEIGHT} pt={16} testID="signup-agreement-sheet" accessible={false}>
      <Title>환영해요!{'\n'}시작 전 약관 동의가 필요해요</Title>
      <SignupAgreement value={agreement} onChange={setAgreement} />
    </YStack>
  );
};

type AgreementFooterProps = {
  bottom: number;
  allAgreed: boolean;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const AgreementFooter = ({ bottom, allAgreed, isPending, onClose, onConfirm }: AgreementFooterProps) => (
  <XStack gap={8} pb={bottom || 16} pt={8}>
    <View flex={1}>
      <Button
        size="large"
        color="tertiary"
        style={{ borderRadius: 10 }}
        onPress={onClose}
        testID="signup-agreement-cancel"
      >
        취소
      </Button>
    </View>
    <View flex={2}>
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
  </XStack>
);

const Title = styled(Text, {
  mt: 8,
  fontSize: 20,
  lineHeight: 28,
  fontWeight: '700',
  color: '$black800',
  letterSpacing: -0.4
});
