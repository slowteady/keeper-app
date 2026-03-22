import { router } from 'expo-router';
import LottieView from 'lottie-react-native';
import { Text, View, YStack } from 'tamagui';

import { useLayout } from '@/shared/model';
import { Button, SafeScreen } from '@/shared/ui';

export default function NotFound() {
  const { bottom } = useLayout();

  return (
    <SafeScreen bg="$white900" justify="center" px="$5">
      <YStack flex={1} items="center" justify="center" gap="$4">
        <View mb="$2">
          <LottieView
            loop={false}
            autoPlay
            source={require('@/assets/animations/notFound.json')}
            style={{ width: 240, height: 240 }}
          />
        </View>

        <Text fontSize={24} fontWeight="$6" color="$black900">
          페이지를 찾을 수 없어요
        </Text>

        <Text fontSize={14} color="$black600" style={{ textAlign: 'center', lineHeight: 22 }}>
          요청하신 페이지가 존재하지 않거나{'\n'}
          잘못된 경로로 접근하셨어요.
        </Text>
      </YStack>

      <View pb={bottom} px="$2">
        <Button size="large" onPress={() => router.replace('/')}>
          홈으로 돌아가기
        </Button>
      </View>
    </SafeScreen>
  );
}
