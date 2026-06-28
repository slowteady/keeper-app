import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const CommunityDetailLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <NavigateHeader /> }}>
      <Stack.Screen name="edit/index" options={{ presentation: 'fullScreenModal', headerShown: false }} />
    </Stack>
  );
};

export default CommunityDetailLayout;
