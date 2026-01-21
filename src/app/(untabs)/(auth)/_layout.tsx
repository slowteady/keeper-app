import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { Spinner, View, YStack } from 'tamagui';

import { useCurrentUser, useLoginRequired } from '@/features/auth';

const AuthLayout = () => {
  const { flags } = useCurrentUser();
  const { actions } = useLoginRequired();

  useEffect(() => {
    if (!flags.isLoading && !flags.isLoggedIn) {
      actions.requireLogin();
    }
  }, [actions, flags.isLoading, flags.isLoggedIn]);

  if (flags.isLoading) {
    return (
      <YStack flex={1} items="center" justify="center" bg="$pageBackground">
        <Spinner size="large" color="$primaryMain" />
      </YStack>
    );
  }

  if (!flags.isLoggedIn) {
    return <View flex={1} bg="$pageBackground" />;
  }

  return <Slot />;
};

export default AuthLayout;
