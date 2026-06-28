import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared/ui';

const ProfileLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default ProfileLayout;
