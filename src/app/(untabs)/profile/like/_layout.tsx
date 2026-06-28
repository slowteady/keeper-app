import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileLikeLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="관심" /> }} />;
};

export default ProfileLikeLayout;
