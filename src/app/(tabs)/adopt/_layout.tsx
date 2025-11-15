import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared';

const AdoptLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <LogoHeader /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default AdoptLayout;
