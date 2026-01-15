import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const AuthLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AuthLayout;
