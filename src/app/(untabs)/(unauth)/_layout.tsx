import { router, Stack } from 'expo-router';
import { useEffect } from 'react';

import { useCurrentUser } from '@/features/auth';

const UnauthLayout = () => {
  const { isLoggedIn } = useCurrentUser();

  useEffect(() => {
    if (isLoggedIn) {
      router.replace('/');
    }
  }, [isLoggedIn]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
};

export default UnauthLayout;
