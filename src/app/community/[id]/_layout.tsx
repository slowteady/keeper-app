import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared';

const CommunityDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default CommunityDetailLayout;
