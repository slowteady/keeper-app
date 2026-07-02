import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { styled, Text, View, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button } from '@/shared/ui';

export default function NotFound() {
  const { top, bottom } = useLayout();

  return (
    <Container style={{ paddingTop: top, paddingBottom: bottom }}>
      <YStack flex={1} items="center" justify="center" gap={16}>
        <LottieView
          loop={false}
          autoPlay
          source={require('@/assets/animations/notFound.json')}
          style={{ width: 240, height: 240 }}
        />

        <Text fontSize={22} fontWeight="700" lineHeight={28} color="$black900">
          페이지를 찾을 수 없어요
        </Text>

        <Description>요청하신 페이지가 존재하지 않거나{'\n'}잘못된 경로로 접근하셨어요</Description>
      </YStack>

      <View pb={16}>
        <Button size="large" onPress={() => router.replace('/')}>
          홈으로 돌아가기
        </Button>
      </View>
    </Container>
  );
}

const Container = styled(YStack, {
  flex: 1,
  bg: '$white900',
  px: 20
});

const Description = styled(Text, {
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 22,
  color: '$black600',
  text: 'center'
});
