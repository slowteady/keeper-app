import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { HeaderLayout } from '@/shared';
import { LeftLineArrow } from '@/shared/ui/icons/mini';
import { Home } from '@/shared/ui/icons/outline';

export const NavigateHeader = () => {
  const { black900 } = useTheme();

  const navigateToPage = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  const left = (
    <Pressable onPress={navigateToPage}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </Pressable>
  );

  const right = (
    <Pressable onPress={() => router.replace('/')}>
      <Home width={28} height={28} color={black900.val} />
    </Pressable>
  );

  return <HeaderLayout left={left} right={right} />;
};
