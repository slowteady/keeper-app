import { router } from 'expo-router';
import { useCallback } from 'react';
import { useTheme, View } from 'tamagui';

import { LeftLineArrow } from '@/shared/ui/icons/mini';
import { Home } from '@/shared/ui/icons/outline';

import { HeaderLayout } from './HeaderLayout';

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
    <View onPress={navigateToPage} hitSlop={10}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </View>
  );

  const right = (
    <View onPress={() => router.replace('/')} hitSlop={10}>
      <Home width={28} height={28} color={black900.val} />
    </View>
  );

  return <HeaderLayout left={left} right={right} />;
};
