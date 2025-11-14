import { Stack } from 'expo-router';

import { CommunityWriteHeader } from '@/widgets';

const CommunityLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="index" options={{ title: '커뮤니티' }} />
      <Stack.Screen name="write" options={{ title: '글쓰기' }} />
      <Stack.Screen name="[id]" options={{ title: '커뮤니티 상세' }} />
    </Stack>
  );
};

export default CommunityLayout;
