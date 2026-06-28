import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared/ui';

const ShelterLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <LogoHeader /> }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ShelterLayout;
