// src/shared/components/_atoms/SafeScreen/SafeScreen.tsx
import { useAtomValue } from 'jotai';
import { View, YStack } from 'tamagui';

import { useLayout } from '@/shared/hooks/useLayout';

import { safeScreenAtom } from './safeScreen.store';
import { SafeScreenProps } from './SafeScreen.types';

export const SafeScreen = ({
  children,
  useSafeArea: propUseSafeArea = true,
  isSafeTop: propSafeTop = true,
  isSafeBottom: propSafeBottom = true,
  customTopPadding,
  customBottomPadding,
  ContainerProps,
  ...props
}: SafeScreenProps) => {
  const layout = useLayout();
  const atomConfig = useAtomValue(safeScreenAtom);

  const useSafeArea = atomConfig.useSafeArea ?? propUseSafeArea;
  const safeTop = atomConfig.safeTop ?? propSafeTop;
  const safeBottom = atomConfig.safeBottom ?? propSafeBottom;

  if (!useSafeArea) {
    return (
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    );
  }

  const topPadding = safeTop ? (customTopPadding ?? layout.top) : 0;
  const bottomPadding = safeBottom ? (customBottomPadding ?? layout.bottom) : 0;

  return (
    <View bg="$white900" flex={1} pt={topPadding} pb={bottomPadding} {...ContainerProps}>
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    </View>
  );
};
