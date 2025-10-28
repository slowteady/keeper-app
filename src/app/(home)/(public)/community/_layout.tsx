import { Stack } from 'expo-router';

import { CommunityWriteHeader } from '@/entities';

const CommunityLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <CommunityWriteHeader /> }}>
      <Stack.Screen name="write" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CommunityLayout;
