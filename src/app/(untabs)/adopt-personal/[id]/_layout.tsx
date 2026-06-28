import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const AdoptPersonalDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AdoptPersonalDetailLayout;
