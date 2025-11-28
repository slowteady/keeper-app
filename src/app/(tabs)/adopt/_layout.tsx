import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared';

const AdoptLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default AdoptLayout;
