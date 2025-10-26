import { Stack } from 'expo-router';

import { WriteHeader } from '@/entities';

const CommunityLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <WriteHeader /> }}>
      <Stack.Screen name="write" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CommunityLayout;
