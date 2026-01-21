import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const LoginLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default LoginLayout;
