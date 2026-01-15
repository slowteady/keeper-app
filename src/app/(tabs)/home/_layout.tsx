import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared/ui';

const HomeLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default HomeLayout;
