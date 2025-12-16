import { Stack } from 'expo-router';

import { CommunityWriteHeader } from '@/entities';

const CommunityLayout = () => {
  return <Stack screenOptions={{ header: () => <CommunityWriteHeader /> }} />;
};

export default CommunityLayout;
