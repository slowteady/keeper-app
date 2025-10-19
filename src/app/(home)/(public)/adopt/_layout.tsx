import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { Header } from '@/shared/components/_molecules';
import { LeftLineArrow } from '@/shared/components/atoms/icons/mini';
import { Home } from '@/shared/components/atoms/icons/outline';

const StackLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <AdoptHeader /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default StackLayout;

const AdoptHeader = () => {
  const { black900 } = useTheme();

  const handlePressBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);
  const handlePressHome = useCallback(() => {
    router.replace('/');
  }, []);

  const left = (
    <Pressable onPress={handlePressBack}>
      <LeftLineArrow width={24} height={24} color={black900.val} />
    </Pressable>
  );
  const right = (
    <Pressable onPress={handlePressHome}>
      <Home width={24} height={24} color={black900.val} />
    </Pressable>
  );

  return <Header left={left} right={right} />;
};
