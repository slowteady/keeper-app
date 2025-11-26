import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared';

const AdoptDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AdoptDetailLayout;
