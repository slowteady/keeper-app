import { Image } from 'expo-image';
import { styled, Text, View, YStack } from 'tamagui';

interface ErrorFallbackProps {
  error: unknown;
  resetError: () => void;
}

const ERROR_IMAGE = require('@/assets/images/error.png');

const ErrorFallback = ({ error, resetError }: ErrorFallbackProps) => {
  return (
    <Container>
      <Image source={ERROR_IMAGE} style={{ width: 120, height: 100, marginBottom: 40 }} contentFit="contain" />

      <Text fontSize={16} fontWeight="bold" lineHeight={18} color="$black900" mb={12}>
        인터넷이 연결되어 있지 않아요
      </Text>
      <Text fontSize={13} fontWeight="500" lineHeight={18} color="$black900" mb={48} text="center">
        {`Wi-fi 또는 셀룰러 데이터 연결을 확인한 후\n다시 시도해 주세요.`}
      </Text>

      <Button onPress={resetError}>
        <Text fontSize={14} fontWeight="500" lineHeight={16} color="$white900">
          다시시도
        </Text>
      </Button>
    </Container>
  );
};

export default ErrorFallback;

const Container = styled(YStack, {
  flex: 1,
  items: 'center',
  justify: 'center',
  bg: '$white900'
});

const Button = styled(View, {
  px: 32,
  py: 16,
  bg: '$black900',
  rounded: 60
});
