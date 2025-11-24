import { HeaderLayout } from '@/shared';
import { Logo } from '@/shared/ui/icons/outline';
import { useTheme } from 'tamagui';

export const LogoHeader = () => {
  const { black900 } = useTheme();

  return <HeaderLayout left={<Logo width={96} height={30} color={black900.val} />} />;
};
