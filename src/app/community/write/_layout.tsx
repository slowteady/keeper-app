import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared';

const CommunityWriteLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default CommunityWriteLayout;
