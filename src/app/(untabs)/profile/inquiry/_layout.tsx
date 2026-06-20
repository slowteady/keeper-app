import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileInquiryLayout = () => {
  return (
    <Stack screenOptions={{ header: ({ options }) => <NavigateHeader text={options.title} /> }}>
      <Stack.Screen name="index" options={{ title: '문의' }} />
      <Stack.Screen name="new" options={{ title: '문의하기' }} />
      <Stack.Screen name="[id]" options={{ title: '문의 상세' }} />
    </Stack>
  );
};

export default ProfileInquiryLayout;
