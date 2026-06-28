import { Image } from 'expo-image';
import { Linking } from 'react-native';
import { styled, Text, View, YStack } from 'tamagui';

type Variant = 'maintenance' | 'soft' | 'hard';

type AppGateScreenProps = {
  variant: Variant;
  storeUrl: string | null;
  message: string | null;
  onDismiss?: () => void;
};

const GATE_IMAGE = require('@/assets/images/keeper-logo.png');

const COPY: Record<Variant, { title: string; description: string }> = {
  maintenance: {
    title: '서비스 점검 중이에요',
    description: '더 나은 서비스를 위해 점검하고 있어요\n잠시 후 다시 이용해 주세요'
  },
  hard: {
    title: '업데이트가 필요해요',
    description: '원활한 이용을 위해\n최신 버전으로 업데이트해 주세요'
  },
  soft: {
    title: '새로운 버전이 나왔어요',
    description: '더 편리해진 keeper를 만나보세요'
  }
};

const AppGateScreen = ({ variant, storeUrl, message, onDismiss }: AppGateScreenProps) => {
  const copy = COPY[variant];
  const description = variant === 'maintenance' && message ? message : copy.description;

  const openStore = () => {
    if (storeUrl) Linking.openURL(storeUrl);
  };

  return (
    <Container>
      <Image source={GATE_IMAGE} style={{ width: 120, height: 100, marginBottom: 40 }} contentFit="contain" />

      <Text fontSize={16} fontWeight="bold" lineHeight={18} color="$black900" mb={12}>
        {copy.title}
      </Text>
      <Text fontSize={13} fontWeight="500" lineHeight={18} color="$black900" mb={48} style={{ textAlign: 'center' }}>
        {description}
      </Text>

      {variant !== 'maintenance' && (
        <YStack gap={12} items="center">
          <PrimaryButton onPress={openStore}>
            <Text fontSize={14} fontWeight="500" lineHeight={16} color="$white900">
              업데이트하기
            </Text>
          </PrimaryButton>
          {variant === 'soft' && onDismiss && (
            <SecondaryButton onPress={onDismiss}>
              <Text fontSize={14} fontWeight="500" lineHeight={16} color="$black900">
                나중에
              </Text>
            </SecondaryButton>
          )}
        </YStack>
      )}
    </Container>
  );
};

export default AppGateScreen;

const Container = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center',
  bg: '$white900'
});

const PrimaryButton = styled(View, {
  px: 32,
  py: 16,
  bg: '$black900',
  rounded: 60
});

const SecondaryButton = styled(View, {
  px: 32,
  py: 16,
  bg: '$white900',
  rounded: 60,
  borderWidth: 1,
  borderColor: '$black900'
});
