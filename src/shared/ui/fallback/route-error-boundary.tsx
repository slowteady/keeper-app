import { AxiosError } from 'axios';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { styled, Text, View, XStack, YStack } from 'tamagui';

type RouteErrorBoundaryProps = {
  error: Error;
  retry: () => void;
};

const ERROR_IMAGE = require('@/assets/images/error.png');

const getErrorInfo = (error: Error) => {
  if (error instanceof AxiosError) {
    if (!error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      return {
        title: '인터넷이 연결되어 있지 않아요',
        description: 'Wi-fi 또는 셀룰러 데이터 연결을 확인한 후\n다시 시도해 주세요'
      };
    }

    const status = error.response?.status;
    if (status && status >= 500) {
      return {
        title: '일시적인 문제가 발생했어요',
        description: '서버에 문제가 생겼어요\n잠시 후 다시 시도해 주세요'
      };
    }
  }

  return {
    title: '문제가 발생했어요',
    description: '잠시 후 다시 시도해 주세요'
  };
};

const ErrorFallbackUI = ({
  error,
  retry,
  secondaryAction
}: RouteErrorBoundaryProps & { secondaryAction: { label: string; onPress: () => void } }) => {
  const { title, description } = getErrorInfo(error);

  return (
    <Container>
      <Image source={ERROR_IMAGE} style={{ width: 120, height: 100, marginBottom: 40 }} contentFit="contain" />

      <Text fontSize={16} fontWeight="bold" lineHeight={18} color="$black900" mb={12}>
        {title}
      </Text>
      <Text fontSize={13} fontWeight="500" lineHeight={18} color="$black900" mb={48} style={{ textAlign: 'center' }}>
        {description}
      </Text>

      <XStack gap={12}>
        <SecondaryButton onPress={secondaryAction.onPress}>
          <Text fontSize={14} fontWeight="500" lineHeight={16} color="$black900">
            {secondaryAction.label}
          </Text>
        </SecondaryButton>
        <PrimaryButton onPress={retry}>
          <Text fontSize={14} fontWeight="500" lineHeight={16} color="$white900">
            다시시도
          </Text>
        </PrimaryButton>
      </XStack>
    </Container>
  );
};

export const RouteErrorBoundary = (props: RouteErrorBoundaryProps) => (
  <ErrorFallbackUI {...props} secondaryAction={{ label: '홈으로', onPress: () => router.replace('/') }} />
);

export const DetailErrorBoundary = (props: RouteErrorBoundaryProps) => (
  <ErrorFallbackUI {...props} secondaryAction={{ label: '뒤로가기', onPress: () => router.back() }} />
);

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
