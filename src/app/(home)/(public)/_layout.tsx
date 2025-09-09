import { Stack } from 'expo-router';

import { SafeScreen } from '@/shared/components/_atoms';
import { PublicHeader } from '@/shared/components/_molecules';

const PublicLayout = () => {
  return (
    <SafeScreen>
      <Stack screenOptions={{ header: () => <PublicHeader /> }}>
        <Stack.Screen name="community" options={{ headerShown: false }} />
      </Stack>
    </SafeScreen>
  );
};

export default PublicLayout;
