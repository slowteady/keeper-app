import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const AdoptDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AdoptDetailLayout;
