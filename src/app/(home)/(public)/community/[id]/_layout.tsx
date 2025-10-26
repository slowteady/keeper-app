import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const CommunityDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <PublicHeader /> }} />;
};

export default CommunityDetailLayout;
