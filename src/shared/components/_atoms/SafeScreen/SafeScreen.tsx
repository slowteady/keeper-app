// src/shared/components/_atoms/SafeScreen/SafeScreen.tsx
import { View } from 'react-native';
import { YStack } from 'tamagui';

import { useLayout } from '@/shared/hooks/useLayout';
import { useAtomValue } from 'jotai';
import { SafeScreenProps } from './SafeScreen.types';
import { safeScreenAtom } from './safeScreen.store';

export const SafeScreen = ({
  children,
  useSafeArea: propUseSafeArea,
  isSafeTop: propSafeTop,
  isSafeBottom: propSafeBottom,
  customTopPadding,
  customBottomPadding,
  ...props
}: SafeScreenProps) => {
  const layout = useLayout();
  const atomConfig = useAtomValue(safeScreenAtom);

  const useSafeArea = propUseSafeArea ?? atomConfig.useSafeArea;
  const safeTop = propSafeTop ?? atomConfig.safeTop;
  const safeBottom = propSafeBottom ?? atomConfig.safeBottom;

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
    <View style={{ flex: 1, paddingTop: topPadding, paddingBottom: bottomPadding }}>
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    </View>
  );
};
