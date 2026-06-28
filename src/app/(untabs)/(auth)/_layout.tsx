import { Slot } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Spinner, View, YStack } from 'tamagui';

import { useCurrentUser, useLoginRequired } from '@/features/auth';

const AuthLayout = () => {
  const { isLoading, isLoggedIn } = useCurrentUser();
  const { requireLogin } = useLoginRequired();
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (triggeredRef.current || isLoading) return;
    triggeredRef.current = true;
    if (!isLoggedIn) {
      requireLogin();
    }
  }, [isLoading, isLoggedIn, requireLogin]);

  if (isLoading) {
    return (
      <YStack flex={1} items="center" justify="center" bg="$pageBackground">
        <Spinner size="large" color="$primaryMain" />
      </YStack>
    );
  }

  if (!isLoggedIn) {
    return <View flex={1} bg="$pageBackground" />;
  }

  return <Slot />;
};

export default AuthLayout;
