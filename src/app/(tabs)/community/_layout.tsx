import { Stack } from 'expo-router';

import { CommunityWriteHeader } from '@/widgets';

const CommunityLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <CommunityWriteHeader /> }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="write" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CommunityLayout;
