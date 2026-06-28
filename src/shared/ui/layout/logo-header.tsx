import { ReactNode } from 'react';
import { useTheme } from 'tamagui';

import { Logo } from '@/shared/ui/icons/outline';

import { HeaderLayout } from './header-layout';

export const LogoHeader = ({ right }: { right?: ReactNode }) => {
  const { black900 } = useTheme();

  return <HeaderLayout left={<Logo width={96} height={30} color={black900.val} />} right={right} />;
};
