import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const MissingDetailLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default MissingDetailLayout;
