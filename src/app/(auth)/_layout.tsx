import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared';

const AuthLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <NavigateHeader /> }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};

export default AuthLayout;
