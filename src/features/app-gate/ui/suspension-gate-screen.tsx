import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { styled, Text, View, YStack } from 'tamagui';

type SuspensionGateScreenProps = {
  reason: string | null;
  suspendedUntil: string | null;
  onConfirm: () => void;
};

const GATE_IMAGE = require('@/assets/images/keeper-logo.png');

const formatPeriod = (suspendedUntil: string | null) =>
  suspendedUntil
    ? `${dayjs(suspendedUntil).format('YYYY년 M월 D일')}까지 이용이 제한돼요`
    : '영구적으로 이용이 제한돼요';

const SuspensionGateScreen = ({ reason, suspendedUntil, onConfirm }: SuspensionGateScreenProps) => (
  <Container>
    <Image source={GATE_IMAGE} style={{ width: 120, height: 100, marginBottom: 40 }} contentFit="contain" />

    <Text fontSize={16} fontWeight="bold" lineHeight={18} color="$black900" mb={12}>
      이용이 정지된 계정이에요
    </Text>
    <Text
      fontSize={13}
      fontWeight="500"
      lineHeight={18}
      color="$black900"
      mb={reason ? 12 : 48}
      style={{ textAlign: 'center' }}
    >
      {formatPeriod(suspendedUntil)}
    </Text>
    {reason && (
      <Text fontSize={13} fontWeight="500" lineHeight={18} color="$black500" mb={48} style={{ textAlign: 'center' }}>
        사유: {reason}
      </Text>
    )}

    <PrimaryButton onPress={onConfirm}>
      <Text fontSize={14} fontWeight="500" lineHeight={16} color="$white900">
        확인
      </Text>
    </PrimaryButton>
  </Container>
);

export default SuspensionGateScreen;

const Container = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center',
  bg: '$white900',
  px: 32
});

const PrimaryButton = styled(View, {
  px: 32,
  py: 16,
  bg: '$black900',
  rounded: 60
});
