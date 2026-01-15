import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ShelterDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default ShelterDetailLayout;
