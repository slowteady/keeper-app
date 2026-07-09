import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const MissingLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ header: () => <NavigateHeader text="실종·분실" /> }} />
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default MissingLayout;
