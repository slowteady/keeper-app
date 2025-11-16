import { Stack } from 'expo-router';

import { LogoHeader } from '@/shared';

const ShelterLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <LogoHeader /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default ShelterLayout;
