import { useTheme } from 'tamagui';

import { Logo } from '../icons/outline';
import { Header } from './Header';

export const LogoHeader = () => {
  const { black900 } = useTheme();

  return <Header left={<Logo width={96} height={30} color={black900.val} />} />;
};
