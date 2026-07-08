import { XStack } from 'tamagui';

import { ChipButton } from '@/shared/ui';

export type MissingFilterBarProps = {
  active: boolean;
  onPressNearby: () => void;
};

export const MissingFilterBar = ({ active, onPressNearby }: MissingFilterBarProps) => {
  return (
    <XStack items="center">
      <ChipButton selected={active} onPress={onPressNearby}>
        내 주변
      </ChipButton>
    </XStack>
  );
};
