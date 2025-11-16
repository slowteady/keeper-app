import { Stack } from 'expo-router';

import { CommunityWriteHeader } from '@/entities';

const CommunityLayout = () => {
  return (
    <Stack screenOptions={{ header: () => <CommunityWriteHeader /> }}>
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default CommunityLayout;
