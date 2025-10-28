import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable } from 'react-native';
import { useTheme } from 'tamagui';

import { Header } from '@/shared';
import { LeftLineArrow } from '@/shared/ui/icons/mini';
import { Pencil } from '@/shared/ui/icons/outline';

export const CommunityWriteHeader = () => {
  const { black900, black800 } = useTheme();
  // const { requireLogin } = useLoginRequired();

  const handlePressBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, []);

  const handlePressWrite = async () => {
    // await requireLogin(() => router.push('/community/write'));
    router.push('/community/write');
  };

  const left = (
    <Pressable onPress={handlePressBack}>
      <LeftLineArrow width={24} height={30} color={black900.val} />
    </Pressable>
  );

  const right = (
    <Pressable onPress={handlePressWrite}>
      <Pencil width={22} height={22} color={black800.val} />
    </Pressable>
  );

  return <Header left={left} right={right} />;
};
