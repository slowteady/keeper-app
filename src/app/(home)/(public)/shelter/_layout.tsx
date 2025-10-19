import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { LeftLineArrow } from '@/shared/components/_atoms/icons/mini';
import { Home } from '@/shared/components/_atoms/icons/outline';
import { Header } from '@/shared/components/_molecules';

const StackLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <ShelterHeader /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default StackLayout;

const ShelterHeader = () => {
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
    router.dismissAll();
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
