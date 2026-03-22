import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileAccountLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="계정관리" /> }} />;
};

export default ProfileAccountLayout;
