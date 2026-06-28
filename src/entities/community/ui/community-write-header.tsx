import { useTheme, View } from 'tamagui';

import { HeaderLayout } from '@/shared/ui';
import { Logo, Pencil } from '@/shared/ui/icons/outline';

type CommunityWriteHeaderProps = {
  onPressWrite: () => void;
};

export const CommunityWriteHeader = ({ onPressWrite }: CommunityWriteHeaderProps) => {
  const { black900, black800 } = useTheme();

  const left = <Logo width={96} height={30} color={black900.val} />;

  const right = (
    <View onPress={onPressWrite} hitSlop={10} testID="community-write-button">
      <Pencil width={22} height={22} color={black800.val} />
    </View>
  );

  return <HeaderLayout left={left} right={right} />;
};
