import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const AdoptDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <PublicHeader /> }} />;
};

export default AdoptDetailLayout;
