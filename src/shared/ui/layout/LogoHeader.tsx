import { useTheme } from 'tamagui';

import { HeaderLayout } from '@/shared';
import { Logo } from '@/shared/ui/icons/outline';

export const LogoHeader = () => {
  const { black900 } = useTheme();

  return <HeaderLayout left={<Logo width={96} height={30} color={black900.val} />} />;
};
