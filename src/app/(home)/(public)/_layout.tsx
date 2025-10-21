import { Stack } from 'expo-router';

import { PublicHeader, SafeScreen } from '@/shared';

const PublicLayout = () => {
  return (
    <SafeScreen>
      <Stack screenOptions={{ header: () => <PublicHeader /> }}>
        <Stack.Screen name="community" options={{ headerShown: false }} />
      </Stack>
    </SafeScreen>
  );
};

export default PublicLayout;
