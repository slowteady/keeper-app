import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared';

const HomeLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default HomeLayout;
