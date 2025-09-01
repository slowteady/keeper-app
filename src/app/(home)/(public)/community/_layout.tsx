import { router, Stack } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { LeftLineArrow } from '@/shared/components/_atoms/icons/mini';
import { Pencil } from '@/shared/components/_atoms/icons/outline';
import { Header } from '@/shared/components/_molecules';

const CommunityLayout = () => {
  return <Stack screenOptions={{ header: () => <WriteHeader /> }} />;
};

export default CommunityLayout;

const WriteHeader = () => {
  const { black800, black900 } = useTheme();

  const handlePressBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);
  const handlePressWrite = () => {
    router.push('/community/write');
  };

  const left = (
    <Pressable onPress={handlePressBack}>
      <LeftLineArrow width={24} height={24} color={black900.val} />
    </Pressable>
  );
  const right = (
    <Pressable onPress={handlePressWrite}>
      <Pencil width={24} height={24} color={black800.val} />
    </Pressable>
  );

  return <Header left={left} right={right} />;
};
