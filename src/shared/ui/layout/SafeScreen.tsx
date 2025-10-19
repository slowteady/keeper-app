import { useAtomValue } from 'jotai';
import { View, ViewProps, YStack, YStackProps } from 'tamagui';

import { useLayout } from '@/shared';

import { safeScreenAtom } from './safeScreen.store';

export interface SafeScreenProps extends YStackProps {
  children: React.ReactNode;
  /**
   * SafeArea 사용 여부
   */
  useSafeArea?: boolean;
  /**
   * SafeArea 상단 사용 여부
   */
  isSafeTop?: boolean;
  /**
   * SafeArea 상단 패딩
   */
  customTopPadding?: number;

  ContainerProps?: ViewProps;
}

export const SafeScreen = ({
  children,
  useSafeArea: propUseSafeArea = true,
  isSafeTop: propSafeTop = true,
  customTopPadding,
  ContainerProps,
  ...props
}: SafeScreenProps) => {
  const layout = useLayout();
  const atomConfig = useAtomValue(safeScreenAtom);

  const useSafeArea = atomConfig.useSafeArea ?? propUseSafeArea;
  const safeTop = atomConfig.safeTop ?? propSafeTop;
  const containerProps = atomConfig.ContainerProps ?? ContainerProps;

  if (!useSafeArea) {
    return (
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    );
  }

  const topPadding = safeTop ? (customTopPadding ?? layout.top) : 0;

  return (
    <View bg="$pageBackground" flex={1} pt={topPadding} {...containerProps}>
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    </View>
  );
};
