import { useTheme } from 'tamagui';

import { Logo } from '@/shared/ui/icons/outline';

import { HeaderLayout } from './HeaderLayout';

export const LogoHeader = () => {
  const { black900 } = useTheme();

  return <HeaderLayout left={<Logo width={96} height={30} color={black900.val} />} />;
};
