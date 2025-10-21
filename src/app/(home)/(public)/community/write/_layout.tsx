import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const CommunityWriteLayout = () => {
  return <Stack screenOptions={{ header: () => <PublicHeader /> }} />;
};

export default CommunityWriteLayout;
