import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileInquiryLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="문의하기" /> }} />;
};

export default ProfileInquiryLayout;
