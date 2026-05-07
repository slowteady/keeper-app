import { Stack } from 'expo-router';

import { NavigateHeader } from '@/shared/ui';

const ProfileNoticeLayout = () => {
  return <Stack screenOptions={{ header: () => <NavigateHeader text="공지사항" /> }} />;
};

export default ProfileNoticeLayout;
