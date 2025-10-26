import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { LeftLineArrow } from '../icons/mini';
import { Home } from '../icons/outline';
import { Header } from './Header';

export const PublicHeader = () => {
  const { black900 } = useTheme();

  const handlePressBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.dismissTo('/');
    }
  }, []);

  const left = (
    <Pressable onPress={handlePressBack}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </Pressable>
  );

  const right = (
    <Pressable onPress={() => router.dismissTo('/')}>
      <Home width={28} height={28} color={black900.val} />
    </Pressable>
  );

  return <Header left={left} right={right} />;
};
