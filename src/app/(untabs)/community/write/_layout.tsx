import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const CommunityWriteLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default CommunityWriteLayout;
