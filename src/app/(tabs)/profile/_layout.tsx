import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared';

const ProfileLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default ProfileLayout;
