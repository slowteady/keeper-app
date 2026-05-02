import { View, ViewProps, YStack, YStackProps } from 'tamagui';

import { useLayout } from '@/shared/model';

export interface SafeScreenProps extends YStackProps {
  children: React.ReactNode;
  useSafeArea?: boolean;
  isSafeTop?: boolean;
  customTopPadding?: number;
  ContainerProps?: ViewProps;
}

export const SafeScreen = ({
  children,
  useSafeArea = true,
  isSafeTop = true,
  customTopPadding,
  ContainerProps,
  ...props
}: SafeScreenProps) => {
  const layout = useLayout();

  if (!useSafeArea) {
    return (
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    );
  }

  const topPadding = isSafeTop ? (customTopPadding ?? layout.top) : 0;

  return (
    <View bg="$pageBackground" flex={1} pt={topPadding} {...ContainerProps}>
      <YStack flex={1} {...props}>
        {children}
      </YStack>
    </View>
  );
};
