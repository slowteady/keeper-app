import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileActivityLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="내 활동" /> }} />;
};

export default ProfileActivityLayout;
