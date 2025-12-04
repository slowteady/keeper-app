import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared';

const AuthLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default AuthLayout;
