import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared/components/_molecules';

const CommunityWriteLayout = () => {
  return <Stack screenOptions={{ header: () => <PublicHeader /> }} />;
};

export default CommunityWriteLayout;
