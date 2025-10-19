import { Stack } from 'expo-router';

import { PublicHeader } from '@/shared';

const CommunityDetailLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <PublicHeader /> }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
};

export default CommunityDetailLayout;
