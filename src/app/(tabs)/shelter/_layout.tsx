import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared/ui';

const ShelterLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default ShelterLayout;
