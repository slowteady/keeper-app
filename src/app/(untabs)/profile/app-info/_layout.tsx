import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileAppInfoLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="앱정보" /> }} />;
};

export default ProfileAppInfoLayout;
