import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const SignupLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader /> }} />;
};

export default SignupLayout;
