import { router } from 'expo-router';
import { useCallback } from 'react';
import { Text, useTheme, View } from 'tamagui';

import { LeftLineArrow } from '@/shared/ui/icons/mini';
import { Home2 } from '@/shared/ui/icons/outline';

import { HeaderLayout } from './header-layout';

export type NavigateHeaderProps = {
  text?: string;
  hideHome?: boolean;
  showShadow?: boolean;
};

export const NavigateHeader = ({ text, hideHome = false, showShadow = true }: NavigateHeaderProps) => {
  const { black900 } = useTheme();

  const navigateToPage = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  const goHome = useCallback(() => {
    router.dismissTo('/(tabs)/home');
  }, []);

  const left = (
    <View onPress={navigateToPage} hitSlop={10}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </View>
  );

  const center = (
    <View flex={1} justify="center" items="center">
      <Text fontSize={20} fontWeight="500" color="$black900">
        {text}
      </Text>
    </View>
  );

  const right = hideHome ? (
    <View width={28} height={28} />
  ) : (
    <View onPress={goHome} hitSlop={10}>
      <Home2 width={28} height={28} color={black900.val} />
    </View>
  );

  return <HeaderLayout showShadow={showShadow} left={left} center={text ? center : undefined} right={right} />;
};
