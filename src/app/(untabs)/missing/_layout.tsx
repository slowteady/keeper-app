import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const MissingLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <NavigateHeader text="실종·분실" /> }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
      <Stack.Screen name="post/[id]/index" options={{ header: () => <NavigateHeader /> }} />
      <Stack.Screen name="post/[id]/map" options={{ header: () => <NavigateHeader text="실종 장소" /> }} />
      <Stack.Screen name="post/[id]/edit" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
      <Stack.Screen name="write" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack>
  );
};

export default MissingLayout;
