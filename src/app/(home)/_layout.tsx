import { Stack } from 'expo-router';

import { useAuth } from '@/domains/auth';

const HomeLayout = () => {
  useAuth();

  return <Stack screenOptions={{ headerShown: false }} />;
};

export default HomeLayout;
