import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared/ui';

const CommunityLayout = () => {
  return <Stack screenOptions={{ header: () => <LogoHeader /> }} />;
};

export default CommunityLayout;
