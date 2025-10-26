import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const PublicLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <PublicHeader /> }}>
      <Stack.Screen name="community" options={{ headerShown: false }} />
    </Stack>
  );
};

export default PublicLayout;
