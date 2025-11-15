import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const ShelterDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <PublicHeader /> }} />;
};

export default ShelterDetailLayout;
