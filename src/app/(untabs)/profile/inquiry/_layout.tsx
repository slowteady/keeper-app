import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileInquiryLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="1:1 문의" /> }} />;
};

export default ProfileInquiryLayout;
